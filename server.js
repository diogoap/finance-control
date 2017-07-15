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
var promise = mongoose.connect(databaseUrl, {
  useMongoClient: true
});
app.use(express.static(__dirname + '/static'))
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(passport.initialize());

// APIs requests ===============================================================
require('./api/apis/authApi.js')(app, url, passport, GoogleStrategy);
require('./api/apis/categoriesApi.js')(app, url);
require('./api/apis/accountsApi.js')(app, url);
require('./api/apis/expensesApi.js')(app, url);
require('./api/apis/incomesApi.js')(app, url);
require('./api/apis/generatorApi.js')(app, url);
require('./api/apis/transfersApi.js')(app, url);
require('./api/apis/totalsApi.js')(app, url);
require('./api/apis/usersApi.js')(app, url);
require('./api/apis/loansApi.js')(app, url);

// Static pages requests =======================================================
app.use("/", function(req, res, next){
    res.sendFile(__dirname + '/static/index.html');
});

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
