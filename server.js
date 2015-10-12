var express = require('express');
var app = express();
var mongoose = require('mongoose');
var port = process.env.PORT || 5000;
var databaseUrl = process.env.MONGOLAB_URI;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var url = require('url');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Configuration ===============================================================
mongoose.connect(databaseUrl);
app.use(express.static(__dirname + '/static'))
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(passport.initialize());

// APIs requests ===============================================================
require('./api/authApi.js')(app, url, passport, GoogleStrategy);
require('./api/categoriesApi.js')(app, url);
require('./api/accountsApi.js')(app, url);
require('./api/expensesApi.js')(app, url);
require('./api/incomesApi.js')(app, url);
require('./api/generatorApi.js')(app, url);
require('./api/transfersApi.js')(app, url);
require('./api/totalsApi.js')(app, url);
require('./api/usersApi.js')(app, url);

// Static pages requests =======================================================
app.use("/", function(req, res, next){
    res.sendFile(__dirname + '/static/index.html');
});

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
