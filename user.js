const models = require("./models");
const jwt = require('./jwt');
const utilities = require('./utilities');

function formatError(code, message){
    var ret = {
        statusCode: code,
        message: message
    };
    return ret;
}

exports.create = function(body){
    return new Promise(function(resolve, reject){
        models.User.findOrCreate({
           where: body
        }).then(function(result){
            var user = result[0].get({plain: true});
            resolve(user);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.invite = function(authParams, email, associationId, t){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            models.User.findOne({
                where: {
                    email: email
                }
            }).then(function(user){
                var userExists = false;
                var hasAssociation = false;

                // 1. check if it exists
                if (user !== null) {
                    userExists = true;
                }

                // 2. if it exists, check if it has association id 
                if (userExists){
                   if (user.AssociationId){
                       hasAssocation = true;
                   }
                }

                // 3. if it has association id, check if it is the same and send 'already associate'
                if (hasAssociation){
                    if (user.AssociationId === associationId){
                        var errMessage = {
                            statusCode: 400,
                            message: "This user is already an associate of this organization"
                        };
                        reject(errMessage);
                    }
                }
                // 4. if it has association id and not the same, send 'part of other association' error
                if (hasAssociation){
                    if (user.AssociationId !== associationId){
                        var errMessage = {
                            statusCode: 400,
                            message: "This user is an associate of another organization"
                        }
                        reject(errMessage);
                    }
                }
                // 5. if it doesn't exist create it and send invite
                // 6. if it exists and doesn't have association, send invite
                var token = utilities.makeid(8);
                var userBody = {
                    AssociationId: associationId,
                    associationStatus: "Invite sent",
                    associationToken: token
                }
                if (userExists){
                    exports.update(authParams, user.id, userBody).then(function(user){
                        resolve(user);
                    }).catch(function(err){
                        reject(err);
                    });                    
                } else {
                    userBody.email = email;
                    exports.create(userBody).then(function(user){
                        resolve(user);
                    }).catch(function(err){
                        reject(err);
                    });
                }

            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.inviteConfirm = function(body){
    return new Promise(function(resolve, reject){
        models.User.findOne({
            where: {associationToken: body.token}
        }).then(function(user){
            var ret = {};
            if (user){
                models.Association.findOne({
                    where: {id: user.AssociationId}
                }).then(function(association){
                    if (user.cognitoId){
                        ret = {
                            association: association.name,
                            operation: "login"
                        }    
                        resolve(ret);
                    } else {
                        ret = {
                            association: association.name,
                            operation: "register"
                        }
                    }
                    resolve(ret);
                }).catch(function(err){
                    reject(err);
                });
            } else {
                ret = {
                    statusCode: 400,
                    message: "Invalid invitation code"
                };
                reject(ret);
            }
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.getUsers = function(authParams, page, limit, offset, where){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            if (jwt.isAdmin(jwtResult)){
                models.User.findAndCountAll({
                    where: where,
                    limit: limit,
                    offset: offset,
                    attributes: ['id', 'email', 'cognitoId','first','last']
                }).then(users => {
                    var ret = {
                        page: page,
                        perPage: limit,
                        users: users
                    };
                    resolve(ret);
                }).catch(err => {
                    reject(err);
                });
            } else {
                ret = {
                    "statusCode": 400,
                    "message": "You do not have access to view users"
                };
                resolve(ret);
            }
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.getUserMe = function(authParams){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            var isAdmin = false;
            if (jwt.isAdmin(jwtResult)){
                isAdmin = true;
            }
            models.User.findOne({
                where: {
                    cognitoId: jwtResult["cognito:username"] 
                }
            }).then(function(result){
                if (result){
                    var user = result.get({plain:true});
                    user.isAdmin = isAdmin;
                    resolve(user);
                } else {
                    var err = {
                        statusCode: 400,
                        message: "User not found in database"
                    };
                    resolve(err);
                }
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.getUser = function(id){
    return new Promise(function(resolve, reject){
        models.User.findOne({
            where: {
                cognitoId: id
            },
            attributes: [
                'id',
                'cognitoId',
                'email',
                'company',
                'first',
                'middle',
                'last',
                 'company',
                 'address1',
                 'address2',
                 'city',
                 'state',
                 'officePhone',
                 'mobilePhone',
                 'optout'
            ]
        }).then(function(result){
            if (result){
                var user = result.get({plain:true});
                resolve(user);
            } else {
                reject(formatError(400, "User not found"));
            } 
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.findByEmail = function(email){
    return new Promise(function(resolve, reject){
        models.User.findOne({
            where: {
                email: email
            }
        }).then(function(user){
            resolve(user);
        }).catch(function(err){
            reject(err);
        });
 
    });
}

exports.updateUserMe = function(authParms, body){
    return new Promise(function(resolve, reject){
        module.exports.getUserMe(authParams).then(function(result){
            models.User.update(
                body,
                {
                    returning: true,
                    where: {id: result.id}
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

exports.update = function(authParams, id, body){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            models.User.update(
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

exports.updateSystem = function(id, body){
    return new Promise(function(resolve, reject){
        models.User.update(
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
    });
}

exports.getEnums = function(){
    return new Promise(function(resolve, reject){
        ret = {};
        ret.states = models.User.rawAttributes.state.values;
        resolve(ret);
    });
}

