'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('./jwt');
const userService = require('./user');
const jwksRsa = require('jwks-rsa');
const sqsService = require('./sqs');
const associationService = require('./association');
const clientService = require('./client');
const utilities = require('./utilities');
const groupService = require('./group');
const clientGroupService = require('./clientGroup');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

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


app.get('/users/me/clients', function(req,res){ 
    var pageParams = utilities.getPageParams(req);
    var where = null;
    var authParams = jwt.getAuthParams(req);
    clientService.getAllMe(authParams, pageParams, where).then(function(clients){
        res.json(clients);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });
});

app.get('/clients', function(req, res){
    var pageParams = utilities.getPageParams(req);
    var where = null;
    var authParams = jwt.getAuthParams(req);
    clientService.getAll(authParams, pageParams, where).then(function(clients){
        res.json(clients);
    }).catch(function(err){
        console.log(err);
        res.status(400).send("error");
        //errorResponse(res, err);
    });
});

app.post('/clients', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    clientService.create(authParams, req.body).then(function(client){
        res.json(client);
    }).catch(function(err){
        errorResponse(res, err);
    });
});


app.get('/clients/:id', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    clientService.get(authParams, req.params.id).then(function(client){
        res.json(client);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.put('/clients/:id', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    clientService.update(authParams, req.params.id, req.body).then(function(client){
        res.json(client);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });
});


app.post('/users/me/clients', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    clientService.createMe(authParams, req.body).then(function(client){
        res.json(client);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });
});

app.get('/users/me/groups', (req, res) => {
    var pageParams = utilities.getPageParams(req);
    var where = null;
    var authParams = jwt.getAuthParams(req);
    groupService.getAllMe(authParams, pageParams, where).then(function(groups){
        res.json(groups);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });
});

app.post('/users/me/groups', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    groupService.createMe(authParams, req.body).then(function(group){
        res.json(group);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });
});

app.get('/users/me/clients/:id/groups', (req, res) => {
    var pageParams = utilities.getPageParams(req);
    var where = null;
    var authParams = jwt.getAuthParams(req);
    clientGroupService.getAllClientGroupsMe(authParams, pageParams, where, req.params.id).then(function(clientGroups){
        res.json(clientGroups);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });
});

app.get('/users/me/groups/:id/clients', (req, res) => {
    var pageParams = utilities.getPageParams(req);
    var where = null;
    var authParams = jwt.getAuthParams(req);
    clientGroupService.getAllGroupClientsMe(authParams, pageParams, where, req.params.id).then(function(clientGroups){
        res.json(clientGroups);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });
});

app.post('/users/me/groups/clients', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    clientGroupService.createMe(authParams, req.body).then(function(clientGroup){
        res.json(clientGroup);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });
});

app.get('/users', function(req, res){
    var page = req.query.page || 1;
    var limit = req.query.perPage || 20;
    var offset = (parseInt(page)-1)*parseInt(limit);
    var where = null;
    if (req.query.email){
        where = {email: req.query.email};
    }
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

app.get('/users/invitations', (req, res) => {
    userService.getInvite(req.query.token, req.query.email).then(function(result){
        res.json(result);
    }).catch(function(err){
        errorResponse(res, err);
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

app.put('/users/invitations', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    userService.acceptInvite(authParams, req.body).then(function(result){
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

app.delete('/associations/:associationId/users/:userId', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    userService.removeAssociation(authParams, req.params.associationId, req.params.userId).then(function(result){
        res.json(result);
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

app.get('/associations/:id/users', (req, res) => {
    userService.getAssociatesPublic(req.params.id).then(function(associates){
        res.json(associates);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.get('/associations/:associationId/users/:userId', (req, res) => {
    var associationId = req.params.associationId;
    var userId = req.params.userId;
    var authParams = jwt.getAuthParams(req);
    userService.getAssociate(authParams, associationId, userId).then(function(associate){
        res.json(associate);
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

// Opt In user to receive email
app.post('/users', (req, res) => {
    userService.optInUser(req.body).then(function(user){
        res.json(user);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

// Opt out user from receiving email
app.put('/users/', (req, res) => {
    userService.optOutUser(req.body).then(function(user){
        res.json(user);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.post('/upload', upload.single('file'), function(req, res){
    var authParams = jwt.getAuthParams(req);
    var fileInfo = {
        path: req.file.path
    };
    clientService.csvImport(authParams, req.file, req.body.group).then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });

});

///////////////////////
// Smartcar
///////////////////////

app.post('/users/me/smartcars', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    smartcarService.createMe(authParams, req.body).then(function(smartcar){
        res.json(smartcar);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.get('/users/me/smartcars', (req, res) => {
    var pageParams = utilities.getPageParams(req);
    var where = null;
    var authParams = jwt.getAuthParams(req);
    smartcarService.getAllMe(authParams, pageParams, where).then(function(smartcars){
        res.json(smartcars);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

/* istanbul ignore if */
if (process.env.NODE_ENV !== "test"){
    app.listen(PORT, HOST);
}
module.exports = app;
