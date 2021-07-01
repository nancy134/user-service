const AWS = require('aws-sdk');
const newUserTopicARN = process.env.AWS_SNS_UPDATE_USER_TOPIC;
const userService = require('./user');

exports.createUserEvent = function(userData){
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

exports.updateUserEvent = function(afterUpdate){
    return new Promise(function(resolve, reject){

        // Check if there are changes to role or association
        var isRoleChanged = false;
        var isAssociationChanged = false;
        if (afterUpdate.fields.indexOf("role") >= 0) isRoleChanged = true;
        if (afterUpdate.fields.indexOf("AssociationId") >=0) isAssociationChanged = true;
 
        if (isRoleChanged || isAssociationChanged){
            var userId = afterUpdate.where.id;
            var updateData = {};
            if (isRoleChanged) updateData.role = afterUpdate.attributes.role
            if (isAssociationChanged) updateData.AssociationId = afterUpdate.attributes.AssociationId;

            userService.findById(userId).then(function(user){
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

