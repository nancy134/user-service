const models = require("./models");
const jwt = require('./jwt');
const utilities = require('./utilities');

exports.systemCreate = function(body){
    return new Promise(function(resolve, reject){
        models.Smartcar.create(body).then(function(result){
            resolve(result);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createMe = function(authParams, body, t){
    return new Promise(function(resolve, reject){
        userService.getUserMe(authParams).then(function(user){
            body.UserId = user.id;
            models.Smartcar.create(
                body,
                { transaction: t}
            ).then(function(smartcar){
                resolve(smartcar);
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

            models.Smartcar.findAndCountAll({
                where: {UserId: user.id},
                limit: pageParams.limit,
                offset: pageParams.offset
            }).then(function(smartcars){
                var ret = {
                    page: pageParams.limit,
                    smartcars: smartcars
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
