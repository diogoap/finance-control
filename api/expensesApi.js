'use strict';

var expensesService = require('./services/expensesService');

function getExpenses(res) {
    expensesService.get(function(error, expenses, status) {
        if (error) {
            sendError(res, error, status);
        } else {          
            res.json(expenses);
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

    app.get('/api/expenses/:id', function(req, res) {
        var expense = expensesService.getById(req.params.id, function(error, expense, status) {
            if (error){
                sendError(res, error, status);
            } else {
                res.json(expense);
            };
        });
    })

    app.get('/api/expenses', function(req, res) {
        getExpenses(res);
    })

    app.post('/api/expenses', function(req, res) {
        expensesService.create(req.body,
            function(error, expense, status) {
                if (error) {        
                    sendError(res, error, status);
                } else {         
                    getExpenses(res);
                };
        });
    })

    app.delete('/api/expenses/:id', function(req, res) {
        expensesService.delete( { _id : req.params.id }, function(error, expense, status) {
            if (error) {
                sendError(res, error, status);
            } else {
                getExpenses(res);
            };
        });  
    })

    app.patch('/api/expenses/:id', function(req, res) {
        expensesService.edit(req.params.id, req.body,
            function(error, expense, status) {
                if (error) {        
                    sendError(res, error, status);
                } else {         
                    getExpenses(res);
                };
        });        
    })  

}