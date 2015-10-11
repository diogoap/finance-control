'use strict';

var passwordHash = require('password-hash');
var utils = require('./services/utilsService');
var usersService = require('./services/usersService');

module.exports = function(app, url, passport, GoogleStrategy, googleClientId, googleClientSecret, googleCallbackURL) {

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
                        user.emailAuthorized = profile.emails[0].value

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
                                console.log('nextTick - login - error on update: ' + error);
                                return done(null, false, { message: 'Erro na atualização dos dados do usuário.' } );
                            }
                        );
                    },
                    function(error, status) {
                        console.log('nextTick - user not authorized');
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

   //  app.get('/auth/google/callback',
   //     passport.authenticate('google', { session: false, failureRedirect: '/auth/error' } ),
   //     function(req, res) {
   //         console.log('callback - OK!!!');
   //         console.log(req.user);
   //         res.redirect('/?id=' + req.user.id + '&email=' + req.user.emailAuthorized + '&token=' + req.user.accessToken + '&name=' + req.user.externalName + '&photo=' + req.user.externalPhoto);
   //     }
   // );
   //
   // app.get('/auth/error',function(req, res, info) {
   //     console.log('callback - ERR');
   //     console.log(info);
   //
   //     res.redirect('/login');
   // });



   //app.get('/logout', function(req, res){
   //    req.logout();
   //    res.json('Logout OK');
   //});

   app.get('/auth/google/callback', function(req, res, next) {
       passport.authenticate('google', function(err, user, info) {
           console.log('/auth/google/callback - IN');
           if (err) {
               console.log('/auth/google/callback - IN - UNEXPECTED ERROR');
               var message = encodeURIComponent('Não foi possível realizar o login. Tente novamente mais tarde.');
               return res.redirect('/login?error=' + message);
           }

           if (!user) {
               console.log('/auth/google/callback - IN - ERROR ==> ' + info.message);
               var message = encodeURIComponent(info.message);
               return res.redirect('/login?error=' + message);
           }

           req.login(user, function(err) {
               if (err) { return next(err); }
               console.log('/auth/google/callback - IN - OK - LOGIN IN!!!');
               return res.redirect('/?id=' + req.user.id + '&email=' + req.user.emailAuthorized + '&token=' + req.user.accessToken + '&name=' + req.user.externalName + '&photo=' + req.user.externalPhoto);
           });
       })(req, res, next);
   });

}
