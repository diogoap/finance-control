'use strict';

var utils = require('./services/utilsService');
var expensesService = require('./services/expensesService');

module.exports = function(app, url) {

    app.get('/api/expenses/:id', utils.ensureAuth, function(req, res) {
        var expense = expensesService.getById(req.params.id,
            function(expense) {
                res.json(expense);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.get('/api/expenses', utils.ensureAuth, function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        expensesService.get(
            utils.getUserId(req),
            query,
            function(expenses) {
                res.json(expenses);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.post('/api/expenses', utils.ensureAuth, function(req, res) {
        expensesService.create(
            utils.getUserId(req),
            req.body,
            function(expense) {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.delete('/api/expenses/:id', utils.ensureAuth, function(req, res) {
        expensesService.delete( { _id : req.params.id },
            function() {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.patch('/api/expenses/:id', utils.ensureAuth, function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        if (query.pay == 'true') {
            expensesService.pay(req.params.id,
                function() {
                    res.json('OK');
                },
                function(error, status) {
                    utils.sendError(res, error, status);
                }
            );
        } else {
            expensesService.edit(req.params.id, req.body,
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
