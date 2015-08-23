'use strict';

var expensesService = require('./services/expensesService');

function sendError(res, error, status) {
    if (status) {
        res.status(status).end('Error: ' + error);
    } else {
        res.status(500).end(error);
    };
}

module.exports = function(app, url) {

    app.get('/api/expenses/:id', function(req, res) {
        var expense = expensesService.getById(req.params.id,
            function(expense) {
                res.json(expense);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.get('/api/expenses', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        expensesService.get(
            query,
            function(expenses) {
                res.json(expenses);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.post('/api/expenses', function(req, res) {
        expensesService.create(req.body,
            function(expenses) {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.delete('/api/expenses/:id', function(req, res) {
        expensesService.delete( { _id : req.params.id },
            function() {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.patch('/api/expenses/:id', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        if (query.pay == 'true') {
            expensesService.pay(req.params.id,
                function() {
                    res.json('OK');
                },
                function(error, status) {
                    sendError(res, error, status);
                }
            );
        } else {
            expensesService.edit(req.params.id, req.body,
                function() {
                    res.json('OK');
                },
                function(error, status) {
                    sendError(res, error, status);
                }
            );
        }
    })

}
