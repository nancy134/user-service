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
