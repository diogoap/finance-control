// set up ======================================================================
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var port = process.env.PORT || 5000;
var databaseUrl = process.env.MONGOLAB_URI;
var googleClientId = process.env.GOOGLE_CLIENT_ID;
var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
var googleCallbackURL = process.env.GOOGLE_CALLBACK_URL;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var url = require('url');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// configuration ===============================================================
mongoose.connect(databaseUrl);
app.use(express.static(__dirname + '/static'))
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(passport.initialize());
app.use(passport.session());

// routes ======================================================================
require('./api/authApi.js')(app, url, passport, GoogleStrategy, googleClientId, googleClientSecret, googleCallbackURL);
require('./api/categoriesApi.js')(app, url);
require('./api/accountsApi.js')(app, url);
require('./api/expensesApi.js')(app, url);
require('./api/incomesApi.js')(app, url);
require('./api/generatorApi.js')(app, url);
require('./api/transfersApi.js')(app, url);
require('./api/totalsApi.js')(app, url);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
