'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('./jwt');
const userService = require('./user');
const jwksRsa = require('jwks-rsa');
const sqsService = require('./sqs');
const associationService = require('./association');
const utilities = require('./utilities');

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

app.post('/users/invite', (req, res) => {
    userService.inviteConfirm(req.body).then(function(result){
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

app.get('/associations', (req, res) => {
    var pageParams = utilities.getPageParams(req);
    var where = null;
    var authParams = jwt.getAuthParams(req);
    associationService.getAll(authParams, pageParams, where).then(function(associations){
        res.json(associations);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.get('/associations/:id', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    associationService.get(authParams, req.params.id).then(function(association){
        res.json(association);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.post('/associations/me', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    associationService.createMe(authParams, req.body).then(function(association){
        res.json(association);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.post('/associations', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    associationService.create(authParams, req.body).then(function(association){
        res.json(association);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.post('/associations/:id/users/me', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    userService.invite(authParams, req.body.email, req.params.id).then(function(association){
        res.json(association);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.put('/associations/:id', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    associationService.update(authParams, req.params.id, req.body).then(function(association){
        res.json(association);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.get('/associations/me/users', (req, res) => {
    var pageParams = utilities.getPageParams(req);
    var authParams = jwt.getAuthParams(req);
    associationService.getAssociatesMe(authParams, pageParams).then(function(associations){
        res.json(associations);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

/*
app.post('/associates/users', (req, res) => {
    var associationBody = {
        name: req.body.name
    };
    sequelize.transation().then(function(t){
        associatonService.create(associationBody, t).then(function(association){
            // loop through users and create promises to send invitations
            var promises = [];
            for (var i=0; i<req.body.users.length; i++){
                var invitePromise = userService.invite(req.body.users[i], null, t);
                promises.push(invitePromise);
            }
            Promise.all(promises).then(function(result){
                t.commit();
                resolve(result);a
            }).catch(function(err){
                t.rollback();
                reject(err);
            }); 
        }).catch(function(err){
            t.rollback();
            reject(err);
        });
    });
});
*/

/* istanbul ignore if */
if (process.env.NODE_ENV !== "test"){
    app.listen(PORT, HOST);
}

module.exports = app;
