'use strict';

var transfersService = require('./services/transfersService');

function sendError(res, error, status) {
    if (status) {
        res.status(status).end('Error: ' + error);
    } else {
        res.status(500).end(error);
    };
}

module.exports = function(app, url) {

    app.get('/api/transfers/:id', function(req, res) {
        var transfer = transfersService.getById(req.params.id,
            function(transfer) {
                res.json(transfer);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.get('/api/transfers', function(req, res) {
        transfersService.get(
            function(transfers) {
                res.json(transfers);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.post('/api/transfers', function(req, res) {
        transfersService.create(req.body,
            function(transfer) {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.delete('/api/transfers/:id', function(req, res) {
        transfersService.delete( { _id : req.params.id },
            function() {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.patch('/api/transfers/:id', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        transfersService.edit(req.params.id, req.body,
            function() {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

}
