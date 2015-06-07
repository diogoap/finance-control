'use strict';

var categoriesService = require('./services/categoriesService');

function getCategories(res) {
    categoriesService.get(function(error, categories, status) {
        if (error) {
            sendError(res, error, status);
        } else {          
            res.json(categories);
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

    app.get('/api/categories/:id', function(req, res) {
        var category = categoriesService.getById(req.params.id, function(error, category, status) {
            if (error){
                sendError(res, error, status);
            } else {
                res.json(category);
            };
        });
    })

    app.get('/api/categories', function(req, res) {
        getCategories(res);
    })

    app.post('/api/categories', function(req, res) {
        categoriesService.create(req.body, function(error, category, status) {
            if (error) {        
                sendError(res, error, status);
            } else {         
                getCategories(res);
            };
        });
    })

    app.delete('/api/categories/:id', function(req, res) {
        categoriesService.delete( { _id : req.params.id }, function(error, category, status) {
            if (error) {
                sendError(res, error, status);
            } else {
                getCategories(res);
            };
        });  
    })

    app.patch('/api/categories/:id', function(req, res) {
        categoriesService.edit(req.params.id, req.body, function(error, category, status) {
            if (error) {
                sendError(res, error, status);
            } else {
                getCategories(res);
            };
        });  
    })  

}