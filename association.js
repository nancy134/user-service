const models = require("./models");
const jwt = require('./jwt');
const userService = require('./user');
const utilities = require('./utilities');

exports.create = function(authParams, body, t){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            if (jwt.isAdmin(jwtResult)){
                models.Association.create(
                    body,
                    { transaction: t}
                ).then(function(association){
                    resolve(association);
                }).catch(function(err){
                    reject(err);
                });
            } else {
                reject(utilities.notAuthorized());
            }
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createMe = function(authParams, body, t){
    return new Promise(function(resolve, reject){
        userService.getUserMe(authParams).then(function(user){
            if (!user.AssociationId){
                models.Association.create(
                    body,
                    { transaction: t}
                ).then(function(association){
                    var userBody = {
                        AssociationId: association.id,
                        associationStatus: "Invite accepted"
                    }
                    userService.updateUserMe(authParams, userBody).then(function(user){
                        resolve(association);
                    }).catch(function(err){
                        reject(err);
                    });
                }).catch(function(err){
                    reject(err);
                });
            } else {
                reject(utilities.alreadyAssociated());
            }
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.inviteMe = function(authParams, body, t){
    return new Promise(function(resolve, reject){
        userService.getUserMe(authParams).then(function(user){
            // Find user by email

        }).catch(function(err){
            reject(err);
        });
    });
}

exports.get = function(authParams, id){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            models.Association.findOne({
                where: {
                    id: id
                }
            }).then(function(association){
                resolve(association);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.update = function(authParams, id, body){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            models.Association.update(
                body,
                {
                    returning: true,
                    where: {id: id}
                }
            ).then(function(update){
                if (!update[0]){
                    reject({message: "No records updated"});
                } else {
                    resolve(update[1][0]);
                }
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.getAll = function(authParams, pageParams, where){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            if (jwt.isAdmin(jwtResult)){
                models.Association.findAndCountAll({
                    where: where,
                    limit: pageParams.limit,
                    offset: pageParams.offset,
                    attributes: ['id', 'name']
                }).then(function(associations){
                    var ret = {
                        page: pageParams.page,
                        perPage: pageParams.limit,
                        associations: associations
                    };
                    resolve(ret);
                }).catch(function(err){
                    reject(err);
                });
            } else {
                reject(utilities.notAuthorized);
            }
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.getAssociatesMe = function(authParams, pageParams){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            userService.getUserMe(authParams).then(function(user){
                models.User.findAndCountAll({
                    where: {"AssociationId" : user.AssociationId},
                    limit: pageParams.limit,
                    offset: pageParams.offset
                }).then(function(users){
                    models.Association.findOne({
                        where: { id: user.AssociationId }
                    }).then(function(association){
                        var ret = {
                            page: pageParams.page,
                            perPage: pageParams.limit,
                            count: users.count,
                            association: association,
                            associates: users.rows
                        };
                        resolve(ret);
                    }).catch(function(err){
                        reject(err);
                    });
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

