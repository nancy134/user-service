const userService = require('./user');
const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');

AWS.config.update({region: 'us-east-1'});
const newUserQueueUrl = process.env.AWS_SQS_NEW_USER_QUEUE

exports.handleSQSMessage = function(message){
    console.log(message);
    var json = JSON.parse(message.Body);
    console.log(json);
    var json2 = JSON.parse(json.Message);
    console.log(json2);
    var body = {
        email: json2.email,
        cognitoId: json2.userSub
    }
    userService.create(body).then(function(result){
        console.log(result);
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
    console.log(err);
    module.exports.handleError(err);
});
module.exports.sqsApp.on('processing_error', (err) => {
    console.log(err);
    module.exports.handleError(err);
});
module.exports.sqsApp.start();

