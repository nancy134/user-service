const models = require("./models");
const jwt = require('./jwt');
const userService = require('./user');
const utilities = require('./utilities');

exports.getAll = function(authParams, pageParams, where){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            if (jwt.isAdmin(jwtResult)){
                models.Group.findAndCountAll({
                    where: where,
                    limit: pageParams.limit,
                    offset: pageParams.offset
                }).then(function(groups){
                    var ret = {
                        page: pageParams.page,
                        perPage: pageParams.limit,
                        groups:groups
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

exports.create = function(authParams, body, t){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            if (jwt.isAdmin(jwtResult)){
                models.Group.create(
                    body,
                    { transaction: t}
                ).then(function(group){
                    resolve(group);
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

exports.get = function(authParams, id){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            models.Group.findOne({
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
            models.Group.update(
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

exports.createMe = function(authParams, body, t){
    return new Promise(function(resolve, reject){
        userService.getUserMe(authParams).then(function(user){
            body.UserId = user.id;
            models.Group.create(
                body,
                { transaction: t}
            ).then(function(group){
                resolve(group);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.getAllMe = function(authParams, pageParams, where){
    return new Promise(function(resolve, reject){
    
        userService.getUserMe(authParams).then(function(user){
            models.Group.findAndCountAll({
                where: {UserId: user.id},
                limit: pageParams.limit,
                offset: pageParams.offset
            }).then(function(groups){
                var ret = {
                    page: pageParams.page,
                    perPage: pageParams.limit,
                    groups: groups
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

exports.getMe = function(authParams, id){
    return new Promise(function(resolve, reject){
        userService.getUserMe(authParams).then(function(user){
            models.Group.findOne({
                where: {
                    id: id,
                    UserId: user.id
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

exports.findOrCreate = function(authParams, name){
    return new Promise(function(resolve, reject){
        userService.getUserMe(authParams).then(function(user){
            models.Group.findOne({
                where: {
                    UserId: user.id,
                    name: name
                }
            }).then(function(group){
                if (group){
                    resolve(group);
                } else {
                    var body = {
                        name: name
                    };
                    exports.createMe(authParams, body).then(function(newGroup){
                        resolve(newGroup);
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

