'use strict';

var utils = require('./services/utilsService');
var totalsService = require('./services/totalsService');

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
                utils.sendError(res, error, status);
            }
        );
    })

}
