'use strict';

var utils = require('../services/utilsService');
var incomesService = require('../services/incomesService');

module.exports = function(app, url) {

    app.get('/api/incomes/:id', utils.ensureAuth, function(req, res) {
        var income = incomesService.getById(req.params.id,
            function(income) {
                res.json(income);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.get('/api/incomes', utils.ensureAuth, function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        incomesService.get(
            utils.getUserId(req),
            query,
            function(incomes) {
                res.json(incomes);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.post('/api/incomes', utils.ensureAuth, function(req, res) {
        incomesService.create(
            utils.getUserId(req),
            req.body,
            function(income) {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.delete('/api/incomes/:id', utils.ensureAuth, function(req, res) {
        incomesService.delete( { _id : req.params.id },
            function() {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.patch('/api/incomes/:id', utils.ensureAuth, function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        if (query.receive == 'true') {
            incomesService.receive(req.params.id,
                function() {
                    res.json('OK');
                },
                function(error, status) {
                    utils.sendError(res, error, status);
                }
            );
        } else {
            incomesService.edit(req.params.id, req.body,
                function() {
                    res.json('OK');
                },
                function(error, status) {
                    utils.sendError(res, error, status);
                }
            );
        }
    })

}
