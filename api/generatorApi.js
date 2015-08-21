'use strict';

var generatorService = require('./services/generatorService');

function sendError(res, error, status) {
    if (status) {
        res.status(status).send('Error: ' + error);
    } else {
        res.status(500).send(error);
    };
}

module.exports = function(app, url) {

    app.post('/api/generator', function(req, res) {
        generatorService.create(req.body,
            function(generatorParameters) {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

}
