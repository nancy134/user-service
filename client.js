
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