'use strict';

var utils = require('./services/utilsService');
var transfersService = require('./services/transfersService');

module.exports = function(app, url) {

    app.get('/api/transfers/:id', function(req, res) {
        var transfer = transfersService.getById(req.params.id,
            function(transfer) {
                res.json(transfer);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.get('/api/transfers', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        transfersService.get(
            query,
            function(transfers) {
                res.json(transfers);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.post('/api/transfers', function(req, res) {
        transfersService.create(req.body,
            function(transfer) {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.delete('/api/transfers/:id', function(req, res) {
        transfersService.delete( { _id : req.params.id },
            function() {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
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
                utils.sendError(res, error, status);
            }
        );
    })

}
