const models = require("./models");

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
            attributes: ['id', 'email', 'cognitoId']
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
exports.create = create;
exports.getUsers = getUsers;
