'use strict';

var totalsService = require('./services/totalsService');

function sendError(res, error, status) {
    if (status) {
        res.status(status).end('Error: ' + error);
    } else {
        res.status(500).end(error);
    };
}

module.exports = function(app, url) {

    app.get('/api/totals', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        totalsService.get(
            query,
            function(totals) {
                res.json(totals);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

}
