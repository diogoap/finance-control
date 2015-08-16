'use strict';

var categoriesService = require('./services/categoriesService');

function sendError(res, error, status) {
    if (status) {
        res.status(status).send('Error: ' + error);
    } else {
        res.status(500).send(error);
    };
}

module.exports = function(app, url) {

    app.get('/api/categories/:id', function(req, res) {
        var category = categoriesService.getById(req.params.id,
            function(category) {
                res.json(category);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.get('/api/categories', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        categoriesService.get(
            query,
            function(categories) {
                res.json(categories);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.post('/api/categories', function(req, res) {
        categoriesService.create(req.body,
            function(categories) {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.delete('/api/categories/:id', function(req, res) {
        categoriesService.delete( { _id : req.params.id },
            function() {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.patch('/api/categories/:id', function(req, res) {
        categoriesService.edit(req.params.id, req.body,
            function(categories) {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

}
