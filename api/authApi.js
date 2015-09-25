'use strict';

var utils = require('./services/utilsService');

module.exports = function(app, url, passport, GoogleStrategy, googleClientId, googleClientSecret, googleCallbackURL) {

    passport.use(
        new GoogleStrategy({
            clientID: googleClientId,
            clientSecret: googleClientSecret,
            callbackURL: googleCallbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                // To keep the example simple, the user's Google profile is returned to
                // represent the logged-in user.  In a typical application, you would want
                // to associate the Google account with a user record in your database,
                // and return that user instead.
                return done(null, profile);
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    //==================================================================
    app.get('/api/test', utils.ensureAuth, function(req, res){
        res.send([{name: "user1"}, {name: "user2"}]);
    });

    app.get('/login', function(req, res){
        res.render('login', { user: req.user });
    });

    app.get('/logout', function(req, res){
        req.logout();
        res.json('Logout OK');
    });

    app.get('/auth/google',
        passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile'] }),
        function(req, res){}
    );

    app.get('/auth/google/callback',
        passport.authenticate('google'),
        function(req, res) {
            res.json('Login OK');
        }
    );

}
