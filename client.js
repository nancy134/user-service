const models = require("./models");
const jwt = require('./jwt');
const userService = require('./user');
const utilities = require('./utilities');
const fs = require('fs');
const csv = require('csv-parser');
const groupService = require('./group');
const clientGroupService = require('./clientGroup');

function removeTempFile(filePath){
    fs.unlink(filePath, (err) => {
        if (err) {
           console.log(err)
        }
    });
}

exports.getAll = function(authParams, pageParams, where){
  return new Promise(function(resolve, reject){
    jwt.verifyToken(authParams).then(function(jwtResult){
      if (jwt.isAdmin(jwtResult)){
        models.Client.findAndCountAll({
          where: where,
          limit: pageParams.limit,
          offset: pageParams.offset,
          attributes: ['id', 'first', 'last', 'email', 'mobilePhone', 'company']

        }).then(function(clients){
          var ret = {
            page: pageParams.page,
            perPage: pageParams.limit,
            clients: clients
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

exports.createMe = function(authParams, body, t){
    return new Promise(function(resolve, reject){
        userService.getUserMe(authParams).then(function(user){
            body.UserId = user.id;
            models.Client.create(
                body,
                { transaction: t}
            ).then(function(client){
                resolve(client);
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
        models.Client.bulkCreate(bodyArray).then(function(result){
            resolve(result);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.getAllMe = function(authParams, pageParams, where){
    return new Promise(function(resolve, reject){
    
        userService.getUserMe(authParams).then(function(user){
            models.Client.findAndCountAll({
                where: {UserId: user.id},
                limit: pageParams.limit,
                offset: pageParams.offset,
                attributes: ['id', 'first', 'last', 'email', 'mobilePhone','company']
            }).then(function(clients){
                var ret = {
                    page: pageParams.page,
                    perPage: pageParams.limit,
                    clients: clients
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
            models.Client.findOne({
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

exports.processImportData = function(authParams, data, groupId, UserId){
    return new Promise(function(resolve, reject){
        var bodyClientArray = [];
        for (var i=0; i<data.length; i++){

            var first = "";
            var last = "";
            var names = data[i].name.split(' ');
            if (names.length == 2){
                first = names[0];
                last = names[1];
            } else if (names.length == 1){
                last = names[0];
            } else if (names.length > 2){
                first = names[0];
                last = names[names.length -1];
            }
       
            var bodyClient = {
                first: first,
                last: last,
                company: data[i].company,
                email: data[i].email,
                UserId: UserId
            };
            bodyClientArray.push(bodyClient);
        }
        exports.bulkCreateMe(bodyClientArray).then(function(result){
            var clientGroupBodyArray = [];
            for (var j=0; j<result.length; j++){
                var clientGroupBody = {
                    ClientId: result[j].id,
                    GroupId: groupId
                };
                clientGroupBodyArray.push(clientGroupBody);
            }
            clientGroupService.bulkCreateMe(clientGroupBodyArray).then(function(result2){
                resolve(result2);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.csvImport = function(authParams, file, group){
    console.log(file);
    var results = [];
    return new Promise(function(resolve, reject){
        userService.getUserMe(authParams).then(function(user){
            fs.createReadStream(file.path)
            .pipe(csv(['company', 'name', 'email']))
            .on('data', (data) => results.push(data))
            .on('end', () => {
                exports.processImportData(authParams, results, group, user.id).then(function(result){
                    resolve(result);
                    removeTempFile(file.path);
                }).catch(function(err){
                    removeTempFile(file.path);
                    reject(err);
                });
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

