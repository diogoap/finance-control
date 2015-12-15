'use strict';

var utils = require('../services/utilsService');
var loansService = require('../services/loansService');

var ensureLoanUser = function(req, res, next) {
	return utils.ensureObjectUser(req, res, next, loansService);
}

module.exports = function(app, url) {

    app.get('/api/loans/:id', utils.ensureAuth, ensureLoanUser, function(req, res) {
        var loan = loansService.getById(req.params.id,
            function(loan) {
                res.json(loan);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.get('/api/loans', utils.ensureAuth, function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        loansService.get(
            utils.getUserId(req),
            query,
            function(loans) {
                res.json(loans);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.post('/api/loans', utils.ensureAuth, function(req, res) {
        loansService.create(
            utils.getUserId(req),
            req.body,
            function(loan) {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.delete('/api/loans/:id', utils.ensureAuth, ensureLoanUser, function(req, res) {
        loansService.delete( { _id : req.params.id },
            function() {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.patch('/api/loans/:id', utils.ensureAuth, ensureLoanUser, function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        if (query.pay == 'true') {
            loansService.pay(req.params.id,
                function() {
                    res.json('OK');
                },
                function(error, status) {
                    utils.sendError(res, error, status);
                }
            );
        } else {
            loansService.edit(req.params.id, req.body,
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
