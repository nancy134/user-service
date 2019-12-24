'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('./jwt');
const rabbitmq = require('./rabbitmq');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello admin.phowma.com\n');
});

app.post('/verifyToken', function(req, res) {
    var IdToken = req.body.IdToken;
    var cognitoClientId = req.body.cognitoClientId;
    var cognitoPoolId = req.body.cognitoPoolId;
    var verifyTokenPromise = jwt.verifyToken(IdToken, cognitoClientId, cognitoPoolId);
    verifyTokenPromise.then(function(result){
        res.send(result);
    }).catch(function(err){
        res.send(err);
    })
});

app.listen(PORT, HOST);

rabbitmq.receive();
