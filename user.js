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

exports.create = create;
