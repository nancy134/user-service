const models = require("./models");

const jwt = require('./jwt');

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
            models.User.findOne({
                where: {
                    cognitoId: jwtResult["cognito:username"] 
                }
            }).then(function(result){
                if (result){
                    var user = result.get({plain:true});
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

