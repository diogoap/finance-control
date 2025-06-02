'use strict';

var utils = require('../services/utilsService');
var usersService = require('../services/usersService');
var googleClientId = process.env.GOOGLE_CLIENT_ID;
var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
var googleCallbackURL = process.env.GOOGLE_CALLBACK_URL;

module.exports = function (app, url, passport, GoogleStrategy) {

    passport.use(
        new GoogleStrategy({
            clientID: googleClientId,
            clientSecret: googleClientSecret,
            callbackURL: googleCallbackURL
        },
            async function (accessToken, refreshToken, profile, done) {
                try {
                    const userData = {
                        externalId: profile.id,
                        email: profile.emails[0].value,
                        accessToken: accessToken,
                        name: profile.name.givenName,
                        photo: profile.photos[0].value
                    };

                    const user = await new Promise((resolve, reject) => {
                        usersService.logIn(userData, resolve, reject);
                    });

                    if (user) {
                        userData.id = user.id;
                        return done(null, userData);
                    }
                    return done(null, false, { message: 'Authentication failed' });
                } catch (error) {
                    console.error('Authentication error:', error);
                    return done(null, false, { message: 'Authentication failed' });
                }
            }
        ));

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    app.get('/auth/google',
        passport.authenticate('google', { session: false, scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email'] }),
        function (req, res) { }
    );

    app.get('/auth/logoff', function (req, res) {
        var url_parts = url.parse(req.url, true);
        var allSessions = url_parts.query.all;

        var user = usersService.logOff(
            utils.getUserId(req),
            utils.getUserToken(req),
            allSessions,
            function (userDb) {
                return res.json('OK');
            },
            function (error, status) {
                utils.sendError(res, 'user not found', 404);
            }
        );
    });

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/login' }),
        function (req, res) {
            let user = req.user;

            if (!user) {
                console.log('/auth/google/callback ==> USER NOT FOUND: ' + info.message);
                var message = encodeURIComponent(info.message);
                return res.redirect('/login?error=' + message);
            }

            req.login(user, function (err) {
                if (err) { return next(err); }
                return res.redirect('/?id=' + user.id + '&email=' + user.email + '&token=' + user.accessToken + '&name=' + user.name + '&photo=' + user.photo);
            });
        });

}
