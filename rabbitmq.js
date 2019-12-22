var amqp = require('amqplib/callback_api');

exports.receive = function(){
    url = "amqp://" + 
          process.env.RABBITMQ_USERNAME +
          ":" +
          process.env.RABBITMQ_PASSWORD +
          "@" +
          process.env.RABBITMQ_HOST +
          ":" +
          process.env.RABBITMQ_PORT
    amqp.connect(url, function(error0, connection) {
        if (error0) {
          throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
            var exchange = 'cognito_users';

            channel.assertExchange(exchange, 'topic', {
                durable: false
            });

            channel.assertQueue('user-service.cognito_user.created', {
                exclusive: true
            }, function(error2, q) {
                if (error2) {
                    throw error2;
                }
                console.log(' [*] Waiting for cognit_user.created event. To exit press CTRL+C');

                //args.forEach(function(key) {
                //    channel.bindQueue(q.queue, exchange, key);
                //});
                channel.bindQueue(q.queue, exchange, "cognito_user.created");

                channel.consume(q.queue, function(msg) {
                    console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
                    var message = msg.content.toString();
                    var jsonMsg = JSON.parse(message);
                    console.log("jsonMsg.email: "+jsonMsg.email);
                }, {
                    noAck: true
                });
            });
        });
    });
}
