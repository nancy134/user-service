const models = require("./models");
const jwt = require('./jwt');
const userService = require('./user');
const utilities = require('./utilities');
const groupService = require('./group');
const clientService = require('./client');

exports.getAllClientGroupsMe = function(authParams, pageParams, where, clientId){
    return new Promise(function(resolve, reject){
        userService.getUserMe(authParams).then(function(user){
            models.ClientGroup.findAndCountAll({
                where: where,
                limit: pageParams.limit,
                offset: pageParams.offset,
                include: [
                {
                    model: models.Group,
                    as: 'group',
                    where: { UserId: user.id},
                    attributes: ['name']
                },
                {
                    model: models.Client,
                    as: 'client',
                    where: { id: clientId, UserId: user.id},
                    attributes: ['first', 'last', 'email', 'mobilePhone']
                }]
            }).then(function(clientGroups){
                var ret = {
                    page: pageParams.page,
                    perPage: pageParams.limit,
                    clientGroups: clientGroups
                };
                resolve(ret);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.getAllGroupClientsMe = function(authParams, pageParams, where, groupId){
    return new Promise(function(resolve, reject){
        userService.getUserMe(authParams).then(function(user){
            models.ClientGroup.findAndCountAll({
                where: where,
                limit: pageParams.limit,
                offset: pageParams.offset,
                include: [
                {
                    model: models.Group,
                    as: 'group',
                    where: {UserId: user.id, id: groupId},
                    attributes: ['name']
                },
                {
                    model: models.Client,
                    as: 'client',
                    where: {UserId: user.id},
                    attributes: ['first', 'last', 'email', 'mobilePhone']
                }]
            }).then(function(clientGroups){
                var rows = [];
                for (var i=0; i<clientGroups.rows.length; i++){
                    rows.push(clientGroups.rows[i].client);
                }
                var newClientGroups = {};
                newClientGroups.count = clientGroups.count;
                newClientGroups.rows = rows;

                var ret = {
                    page: pageParams.page,
                    perPage: pageParams.limit,
                    clientGroups: newClientGroups
                };
                resolve(ret);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createMe = function(authParams, body){
    return new Promise(function(resolve, reject){
        userService.getUserMe(authParams).then(function(user){
            exports.checkGroupClient(authParams, body).then(function(check){
                models.ClientGroup.create(body).then(function(clientGroup){
                    resolve(clientGroup);
                }).catch(function(err){
                    reject(err);
                });
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.bulkCreateMe = function(bodyArray){
    return new Promise(function(resolve, reject){
        models.ClientGroup.bulkCreate(bodyArray).then(function(results){
            resolve(results);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.checkGroupClient = function(authParams, body){
    return new Promise(function(resolve, rject){
        groupService.getMe(authParams, body.GroupId).then(function(group){
            var errMessage = {
                message: "Invalid group or client"
            }
            if (group){
                clientService.getMe(authParams,body.ClientId).then(function(client){
                    if (client){
                        resolve(client);
                    } else {
                        reject(errMessage);
                    }
                }).catch(function(err){
                    reject(err);
                });
            } else {
                reject(errMessage);
            }
        }).catch(function(err){
            reject(err);
        });
    });
}

