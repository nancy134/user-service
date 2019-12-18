'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('./jwt');

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
    var AccessToken = req.body.AccessToken;
    var verifyTokenPromise = jwt.verifyToken(AccessToken);
    verifyTokenPromise.then(function(result){
        res.send(result);
    }).catch(function(err){
        res.send(err);
    })
});

app.listen(PORT, HOST);
