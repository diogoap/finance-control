'use strict';

var expensesService = require('./services/expensesService');

function getExpenses(res) {
    expensesService.get(
        function(expenses) {      
            res.json(expenses);    
        },
        function(error, status) {
            sendError(res, error, status);
        }
    );
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
        getExpenses(res);
    })

    app.post('/api/expenses', function(req, res) {
        expensesService.create(req.body,
            function(expenses) {
                getExpenses(res);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.delete('/api/expenses/:id', function(req, res) {
        expensesService.delete( { _id : req.params.id }, 
            function() {
                getExpenses(res);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );  
    })

    app.patch('/api/expenses/:id', function(req, res) {
        expensesService.edit(req.params.id, req.body,
            function(expenses) {
                getExpenses(res);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );        
    })  

}