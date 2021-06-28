const AWS = require('aws-sdk');
const newUserTopicARN = process.env.AWS_SNS_UPDATE_USER_TOPIC;
const userService = require('./user');

exports.updateUserEvent = function(userData){
    return new Promise(function(resolve, reject){

        if (userData.role || userData.AssociationId){
            userService.findById(userData.id).then(function(user){
                var updateData = {};
                if (userData.role) updateData.role = userData.role;
                if (userData.AssociationId) updateData.AssociationId = userData.AssociationId;
                if (user.cognitoId) updateData.cognitoId  = user.cognitoId;
                if (user.email) updateData.email = user.email;

                var params = {
                    Message: JSON.stringify(updateData),
                    TopicArn: newUserTopicARN
                };
                var publishPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
                publishPromise.then(function(data){
                    resolve(data);
                }).catch(function(err){
                    reject(err);
                });
            }).catch(function(err){
                reject(err);
            });
        }
    });
}

