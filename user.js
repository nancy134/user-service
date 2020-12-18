const models = require("./models");
const jwt = require('./jwt');

var create = function(body, t){
    return new Promise(function(resolve, reject){
        models.User.findOrCreate({
           where: body,
           transaction: t
        }).then(function(result){
            var user = result[0].get({plain: true});
            resolve(user);
        }).catch(function(err){
            reject(err);
        });
    });
}

var getUsers = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
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
    });
}

var getUser = function(IdToken, cognitoClientId, cognitoPoolId){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(IdToken, cognitoClientId, cognitoPoolId).then(function(jwtResult){      
            models.User.findOne({
                where: {
                    cognitoId: jwtResult["cognito:username"] 
                }
            }).then(function(result){
                result.dataValues.stateOptions = models.User.rawAttributes.state.values;
                resolve(result);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

var update = function(IdToken, id, body, t){
    return new Promise(function(resolve, reject){
        var cognitoClientId = body.cognitoClientId;
        var cognitoPoolId = body.cognitoPoolId;
        jwt.verifyToken(IdToken, cognitoClientId, cognitoPoolId).then(function(jwtResult){
            models.User.update(
                body,
                {
                    returning: true,
                    where: {id: id},
                    transaction: t
                }
            ).then(function([rowsUpdate, [user]]){
                resolve(user);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.create = create;
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.update = update;
