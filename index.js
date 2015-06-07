// set up ======================================================================
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var port = process.env.PORT || 5000;
var databaseUrl = process.env.MONGOLAB_URI;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// configuration ===============================================================
mongoose.connect(databaseUrl);
app.use(express.static(__dirname + '/static'))
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride('X-HTTP-Method-Override'));

// routes ======================================================================
require('./api/categoriesApi.js')(app);
require('./api/accountsApi.js')(app);
require('./api/expensesApi.js')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);