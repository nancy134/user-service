
const models = require("./models");
const jwt = require('./jwt');
const userService = require('./user');
const utilities = require('./utilities');
exports.getAll = function(authParams, pageParams, where){
  return new Promise(function(resolve, reject){
    jwt.verifyToken(authParams).then(function(jwtResult){
      if (jwt.isAdmin(jwtResult)){
        models.Client.findAndCountAll({
          where: where,
          limit: pageParams.limit,
          offset: pageParams.offset,
          attributes: ['id', 'name']
        }).then(function(clients){
          var ret = {
            page: pageParams.page,
            perPage: pageParams.limit,
            client: clients
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
                models.Client.create(
                    body,
                    { transaction: t}
                ).then(function(client){
                    resolve(client);
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
            models.Client.findOne({
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
            models.Client.update(
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