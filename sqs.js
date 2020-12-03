const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});
const queueUrl = "https://sqs.us-east-1.amazonaws.com/461318555119/new-user";

function processMessage(queueURL, data){
     console.log("processMessage");
     var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
     for (var i=0; i<data.Messages.length; i++){
         var deleteParams = {
            QueueUrl: queueURL,
            ReceiptHandle: data.Messages[i].ReceiptHandle
         };
         sqs.deleteMessage(deleteParams, function(err, data) {
             if (err) {
                 console.log("Delete Error", err);
             } else {
                 //console.log("Message Deleted", data);
             }
         });
     }
}

function receiveMessage(){
    console.log("receiveMessage");
    var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

    var queueURL = "https://sqs.us-east-1.amazonaws.com/461318555119/sabre-create-user";

    var params = {
        AttributeNames: [
            "SentTimestamp"
        ],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: [
            "All"
        ],
        QueueUrl: queueURL,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0
    };

    sqs.receiveMessage(params, function(err, data) {
        if (err) {
            console.log(err);
        } else if (data.Messages) {
            processMessage(queueURL, data);
        }  
    });
}

function receiveQueuedMessages(){
    console.log("receiveQueuedMessage");
    var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
    var queueURL = "https://sqs.us-east-1.amazonaws.com/461318555119/sabre-create-user";
    var params = {
        QueueUrl: queueURL,
        AttributeNames: ['ApproximateNumberOfMessages']
    };
    sqs.getQueueAttributes(params, function(err, data){
        console.log(data);
        if (err){
            console.log(err);
        } else {
            for (var i=0; i<data.Attributes.ApproximateNumberOfMessages; i++){
                receiveMessage();
            }
        }
    });
}

exports.receiveMessage = receiveMessage;
exports.receiveQueuedMessages = receiveQueuedMessages;
