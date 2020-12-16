'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('./jwt');

const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
const userService = require('./user');

AWS.config.update({region: 'us-east-1'});
const newUserQueueUrl = "https://sqs.us-east-1.amazonaws.com/461318555119/new-user";

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('user-service\n');
});

function getToken(req){
    var authorization = req.get("Authorization");
    var array = authorization.split(" ");
    var IdToken = array[1];
    return IdToken;
}

app.post('/verifyToken', function(req, res) {
    var IdToken = getToken(req);
    var cognitoClientId = req.body.cognitoClientId;
    var cognitoPoolId = req.body.cognitoPoolId;
    var verifyTokenPromise = jwt.verifyToken(IdToken, cognitoClientId, cognitoPoolId);
    verifyTokenPromise.then(function(result){
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
    userService.getUsers(page, limit, offset, where).then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log(err);
    }); 
});

app.get('/user', function(req, res){
    var IdToken = jwt.getToken(req);
    var cognitoClientId = req.query.cognitoClientId;
    var cognitoPoolId = req.query.cognitoPoolId;
    userService.getUser(IdToken, cognitoClientId, cognitoPoolId).then(function(result){
        res.json(result);
    }).catch(function(err){
        if (err.statusCode){
            res.status(err.statusCode).send(err);
        } else {
            res.send(err);
        }
    });
});

app.put('/users/:id', (req, res) => {
    var IdToken = jwt.getToken(req); 
    userService.update(IdToken, req.params.id, req.body).then(function(result){
        res.json(result);
    }).catch(function(err){
        if (err.statusCode){
            res.status(err.statusCode).json(err);
        } else {
            res.send(err);
        }
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
app.listen(PORT, HOST);
