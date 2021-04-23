const models = require("./models");

const jwt = require('./jwt');

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

exports.getEnums = function(){
    return new Promise(function(resolve, reject){
        ret = {};
        ret.states = models.User.rawAttributes.state.values;
        resolve(ret);
    });
}

