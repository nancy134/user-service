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
    console.log("IdToken: "+IdToken);
    var cognitoClientId = req.body.cognitoClientId;
    var cognitoPoolId = req.body.cognitoPoolId;
    var verifyTokenPromise = jwt.verifyToken(IdToken, cognitoClientId, cognitoPoolId);
    verifyTokenPromise.then(function(result){
        res.send(result);
    }).catch(function(err){
        res.send(err);
    })
});

app.get('/profile', function(req, res){
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
