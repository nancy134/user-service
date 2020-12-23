const proxyquire = require("proxyquire");
describe("SQS success", () => {
    var mockUser = {
        create: function(){
            var result = { first: "Nancy" };
            return Promise.resolve(result);
        }
    };

    var sqs = proxyquire("../sqs", {
        "./user": mockUser
    });

    it("handleSQSMessage", done => {
        var message = {Body: '{"Message" : "{\\"email\\":\\"nancy_piedra@hotmail.com\\",\\"userSub\\":\\"cd0c2f99-7e52-4445-9338-3d931da54930\\"}"}'};

        sqs.handleSQSMessage(message);
        done();
    });
});

describe("SQS failure", () => {
    var mockUser = {
        create: function(){
            var result = { err: "error message" };
            return Promise.reject(result);
        }
    };

    var sqs = proxyquire("../sqs", {
        "./user": mockUser
    });

    it("handleSQSMessage", done => {
        var message = {Body: '{"Message" : "{\\"email\\":\\"nancy_piedra@hotmail.com\\",\\"userSub\\":\\"cd0c2f99-7e52-4445-9338-3d931da54930\\"}"}'};

        sqs.handleSQSMessage(message);
        done();
    });

});

describe("SQS events", () => {
    var sqs = require("../sqs");
    beforeEach(function(){
    });
    it('on error', function(done){
        sqs.sqsApp.emit("error");
        done();
    });
    it('on processing_error', function(done){
        sqs.sqsApp.emit("processing_error");
        done();
    });
});
