'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('./jwt');
const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
const userService = require('./user');

const jwksRsa = require('jwks-rsa');

AWS.config.update({region: 'us-east-1'});
const newUserQueueUrl = process.env.AWS_SQS_NEW_USER_QUEUE

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
    var IdToken = getToken(req);
    var jwksUri = jwt.getJwksUri(req.body.cognitoPoolId);
    jwt.verifyToken(IdToken, jwksUri).then(function(result){
        res.send(result);
    }).catch(function(err){
        res.send(err);
    });
});

function getToken(req){
    var authorization = req.get("Authorization");
    var array = authorization.split(" ");
    var IdToken = array[1];
    return IdToken;
}

app.get('/verifyToken', function(req, res) {
    var IdToken = getToken(req);
    var jwksUri = jwt.getJwksUri(req.body.cognitoPoolId);
    jwt.verifyToken(IdToken, jwksUri).then(function(result){
        res.send(result);
    }).catch(function(err){
        res.send(err);
    })
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
        console.log(err);
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

const sqsApp = Consumer.create({
    queueUrl: newUserQueueUrl,
    handleMessage: async (message) => {
        var json = JSON.parse(message.Body);
        var json2 = JSON.parse(json.Message);
        var body = {
            email: json2.email,
            cognitoId: json2.userSub
        }
        userService.create(body).then(function(result){
        }).catch(function(err){
            console.log(err);
        }); 
    },
    sqs: new AWS.SQS()
});

sqsApp.on('error', (err) => {
    console.log(err);
});
sqsApp.on('processing_error', (err) => {
    console.log(err);
});
sqsApp.start();

if (process.env.NODE_ENV !== "test"){
    app.listen(PORT, HOST);
}

module.exports = app;
