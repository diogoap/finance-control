'use strict';

var accountsService = require('./services/accountsService');

function getAccounts(res) {
    accountsService.get(function(error, accounts, status) {
        if (error) {
            sendError(res, error, status);
        } else {          
            res.json(accounts);
        };
    });
};

function sendError(res, error, status) {
    if (status) {
        res.status(status).send(error);    
    } else {
        res.status(500).send(error);   
    };
}

module.exports = function(app) {

    app.get('/api/accounts/:id', function(req, res) {
        var account = accountsService.getById(req.params.id, function(error, account, status) {
            if (error){
                sendError(res, error, status);
            } else {
                res.json(account);
            };
        });
    })

    app.get('/api/accounts', function(req, res) {
        getAccounts(res);
    })

    app.post('/api/accounts', function(req, res) {
        accountsService.create( {
            name: req.body.name,
            initialBalance: req.body.initialBalance },
            function(error, account, status) {
                if (error) {        
                    sendError(res, error, status);
                } else {         
                    getAccounts(res);
                };
        });
    })

    app.delete('/api/accounts/:id', function(req, res) {
        accountsService.delete( { _id : req.params.id }, function(error, account, status) {
            if (error) {
                sendError(res, error, status);
            } else {
                getAccounts(res);
            };
        });  
    })

    app.patch('/api/accounts/:id', function(req, res) {
        accountsService.edit( req.params.id, {
            name: req.body.name,
            initialBalance: req.body.initialBalance },
            function(error, account, status) {
                if (error) {        
                    sendError(res, error, status);
                } else {         
                    getAccounts(res);
                };
        });
    })  

}