'use strict';

var passwordHash = require('password-hash');
var utils = require('./services/utilsService');
var usersService = require('./services/usersService');
var googleClientId = process.env.GOOGLE_CLIENT_ID;
var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
var googleCallbackURL = process.env.GOOGLE_CALLBACK_URL;

module.exports = function(app, url, passport, GoogleStrategy) {

    passport.use(
        new GoogleStrategy({
            clientID: googleClientId,
            clientSecret: googleClientSecret,
            callbackURL: googleCallbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                var user = usersService.getByEmail(profile.emails[0].value,
                    function(userDb) {

                        if (userDb.userEnabled == false) {
                            console.log('nextTick ==> User not enabled');
                            return done(null, false, { message: 'Usuário desativado. Contate o administrador do sistema.' } );
                        }

                        var user = {};
                        user.externalId = profile.id;
                        user.externalPhoto = profile.photos[0].value;
                        user.accessToken = passwordHash.generate(accessToken);

                        if (profile.name.givenName.length == 0) {
                            user.externalName = 'User';
                        } else {
                            user.externalName = profile.name.givenName;
                        }

                        usersService.edit(userDb.id, user,
                            function(userEdited) {
                                var userData = {};
                                userData.accessToken = accessToken;
                                userData.id = userEdited.id;
                                userData.emailAuthorized = userEdited.emailAuthorized;
                                userData.externalName = userEdited.externalName;
                                userData.externalPhoto = userEdited.externalPhoto;

                                return done(null, userData);
                            },
                            function(error, status) {
                                console.log('nextTick ==> Login - error on update: ' + error);
                                return done(null, false, { message: 'Erro na atualização dos dados do usuário.' } );
                            }
                        );
                    },
                    function(error, status) {
                        console.log('nextTick ==> User not authorized');
                        return done(null, false, { message: 'Você não está autorizado para accessar essa aplicação.' } );
                    }
                );
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    app.get('/auth/google',
        passport.authenticate('google', { session: false, scope: ['https://www.googleapis.com/auth/userinfo.email'] }),
        function(req, res){}
    );

   app.get('/auth/logoff', function(req, res) {
       var user = usersService.logOff(utils.getUserId(req),
            function(userDb) {
                return res.json('OK');
           },
           function(error, status) {
               utils.sendError(res, 'user not found', 404);
           }
       );
   });

   app.get('/auth/google/callback', function(req, res, next) {
       passport.authenticate('google', function(err, user, info) {
           if (err) {
               console.log('/auth/google/callback ==> UNEXPECTED ERROR');
               var message = encodeURIComponent('Não foi possível realizar o login. Tente novamente mais tarde.');
               return res.redirect('/login?error=' + message);
           }

           if (!user) {
               console.log('/auth/google/callback ==> USER NOT FOUND: ' + info.message);
               var message = encodeURIComponent(info.message);
               return res.redirect('/login?error=' + message);
           }

           req.login(user, function(err) {
               if (err) { return next(err); }
               return res.redirect('/?id=' + req.user.id + '&email=' + req.user.emailAuthorized + '&token=' + req.user.accessToken + '&name=' + req.user.externalName + '&photo=' + req.user.externalPhoto);
           });
       })(req, res, next);
   });

}
