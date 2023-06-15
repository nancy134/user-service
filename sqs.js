const userService = require('./user');
const smartcarService = require('./smartcar');

const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');

AWS.config.update({region: 'us-east-1'});
const newUserQueueUrl = process.env.AWS_SQS_NEW_USER_QUEUE

exports.handleSQSMessage = function(message){
    console.log(message);
    var json = JSON.parse(message.Body);
    var json2 = JSON.parse(json.Message);
    console.log(json2);

    var userBody = {};
    if (json2.email) userBody.email = json2.email;
    if (json2.userSub) userBody.cognitoId = json2.userSub;
    if (json2.role) userBody.role = json2.role;

    var smartcarBody = {};
    if (json2.accessToken) smartcarBody.accessToken = json2.accessToken;
    if (json2.refreshToken) smartcarBody.refreshToken = json2.refreshToken;
    if (json2.expiration) smartcarBody.expiration = json2.expiration;
    if (json2.refreshExpiration) smartcarBody.refreshExpiration = json2.refreshExpiration;
    

    userService.findByEmail(userBody.email).then(function(user){

        if (!user){
            userService.systemCreate(userBody).then(function(result){
                console.log(result);
                smartcarBody.UserId = result.id;

                smartcarService.systemCreate(smartcarBody).then(function(result2){
                    console.log(result2);
                }).catch(function(err){
                    console.log(err);
                });
            }).catch(function(err){
                console.log(err);
            });

        } else {
            userService.systemUpdate(user.id, userBody).then(function(result){
            }).catch(function(err){
                console.log(err);
            });
        }
    }).catch(function(err){
        console.log(err);
    });

}


exports.sqsApp = Consumer.create({
    queueUrl: newUserQueueUrl,
    handleMessage: module.exports.handleSQSMessage,
    sqs: new AWS.SQS()
});

exports.handleError = function(err){
    console.log(err);
};
module.exports.sqsApp.on('error', (err) => {
    module.exports.handleError(err);
});
module.exports.sqsApp.on('processing_error', (err) => {
    module.exports.handleError(err);
});
module.exports.sqsApp.start();

