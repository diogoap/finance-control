var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.set('strictQuery', false);
var port = process.env.PORT || 8500;
var databaseUrl = process.env.MONGO_ATLAS_URI;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var url = require('url');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Configuration ===============================================================
var promise = mongoose.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true, retryWrites: false });

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(express.static(__dirname + '/web/dist'))
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.json({ type: 'application/vnd.api+json', limit: '1mb' }));
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
require('./api/apis/currenciesApi.js')(app, url);

function isSafeLocalRedirectPath(pathname) {
    if (typeof pathname !== 'string') return false;
    if (!pathname.startsWith('/') || pathname.startsWith('//')) return false;
    if (pathname.indexOf('\\') !== -1) return false;
    if (pathname.indexOf('..') !== -1) return false;
    if (/[\u0000-\u001F\u007F]/.test(pathname)) return false;
    return /^\/[A-Za-z0-9\-._~!$&'()*+,;=:@/?%]*$/.test(pathname);
}

// Legacy /app/* → strip prefix. The SPA used to live under /app/ during the
// AngularJS → Vue migration; this redirect keeps old bookmarks working.
app.get(/^\/app(\/.*)?$/, function (req, res) {
    var subpath = req.url.replace(/^\/app/, '') || '/';
    var safeSubpath = ('/' + subpath).replace(/^\/+/, '/');
    res.redirect(isSafeLocalRedirectPath(safeSubpath) ? safeSubpath : '/');
});

// SPA HTML fallback for client-routed paths (/expenses, /login, ...).
// Excludes /api/* and /auth/* so unmatched API routes 404 normally.
app.get(/^\/(?!api\/|auth\/|app(\/|$)).*$/, function (req, res) {
    res.sendFile(__dirname + '/web/dist/index.html');
});

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
