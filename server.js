'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('./jwt');
const userService = require('./user');
const jwksRsa = require('jwks-rsa');
const sqsService = require('./sqs');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

function errorResponse(res, err){
    if (err.statusCode){
        res.status(err.statusCode).send(err);
    } else {
        res.status(400).send(err);
    }
}
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    console.log("user-service");
    res.send("user-service");
});

app.get('/users', function(req, res){
    var page = req.query.page || 1;
    var limit = req.query.perPage || 20;
    var offset = (parseInt(page)-1)*parseInt(limit);
    var where = null;
    var authParams = jwt.getAuthParams(req);
    userService.getUsers(authParams, page, limit, offset, where).then(function(result){
        res.json(result);
    }).catch(function(err){
        errorResponse(res, err);
    }); 
});

app.get('/user/me', function(req, res){
    var authParams = jwt.getAuthParams(req);
    userService.getUserMe(authParams).then(function(result){
        res.json(result);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.put('/user/me', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    userService.updateUserMe(authParams, req.body).then(function(result){
        res.json(result);
    }).catch(function(err){
        errorResponse(res,err);
    });
});

app.get('/users/:id', (req, res) => {
    var id = req.params.id;
    userService.getUser(id).then(function(result){
        res.json(result);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.get('/enums', (req, res) => {
    userService.getEnums().then(function(result){
        res.json(result);
    });
});

/* istanbul ignore if */
if (process.env.NODE_ENV !== "test"){
    app.listen(PORT, HOST);
}

module.exports = app;
