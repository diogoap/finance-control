'use strict';

var utils = require('../services/utilsService');
var currenciesService = require('../services/currenciesService');

var ensureCurrencyUser = function (req, res, next) {
    return utils.ensureObjectUser(req, res, next, currenciesService);
}

module.exports = function (app, url) {

    app.get('/api/currencies/:id', utils.ensureAuth, ensureCurrencyUser, function (req, res) {
        var currency = currenciesService.getById(req.params.id,
            function (currency) {
                res.json(currency);
            },
            function (error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.get('/api/currencies', utils.ensureAuth, function (req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        currenciesService.get(
            utils.getUserId(req),
            query,
            function (currencies) {
                res.json(currencies);
            },
            function (error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.post('/api/currencies', utils.ensureAuth, function (req, res) {
        currenciesService.create(
            utils.getUserId(req),
            req.body,
            function (currencies) {
                res.json('OK');
            },
            function (error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.delete('/api/currencies/:id', utils.ensureAuth, ensureCurrencyUser, function (req, res) {
        utils.sendError(res, 'Operação não suportada - Inative o registro', 405);
    })

    app.patch('/api/currencies/:id', utils.ensureAuth, ensureCurrencyUser, function (req, res) {
        currenciesService.edit(req.params.id, req.body,
            function (currencies) {
                res.json('OK');
            },
            function (error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

}
