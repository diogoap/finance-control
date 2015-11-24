'use strict';

var utils = require('../services/utilsService');
var generatorService = require('../services/generatorService');

module.exports = function(app, url) {

    app.post('/api/generator', utils.ensureAuth, function(req, res) {
        generatorService.create(
            utils.getUserId(req),
            req.body,
            function(generatorParameters) {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

}
