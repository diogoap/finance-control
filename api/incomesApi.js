'use strict';

var incomesService = require('./services/incomesService');

function sendError(res, error, status) {
    if (status) {
        res.status(status).end('Error: ' + error);
    } else {
        res.status(500).end(error);
    };
}

module.exports = function(app, url) {

    app.get('/api/incomes/:id', function(req, res) {
        var income = incomesService.getById(req.params.id,
            function(income) {
                res.json(income);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.get('/api/incomes', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        incomesService.get(
            query,
            function(incomes) {
                res.json(incomes);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.post('/api/incomes', function(req, res) {
        incomesService.create(req.body,
            function(income) {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.delete('/api/incomes/:id', function(req, res) {
        incomesService.delete( { _id : req.params.id },
            function() {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.patch('/api/incomes/:id', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        if (query.receive == 'true') {
            incomesService.receive(req.params.id,
                function() {
                    res.json('OK');
                },
                function(error, status) {
                    sendError(res, error, status);
                }
            );
        } else {
            incomesService.edit(req.params.id, req.body,
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
