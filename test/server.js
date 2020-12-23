const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");
const proxyquire = require("proxyquire");

chai.use(chaiHttp);
chai.should();

describe("server successful tests", () => {

    var mockUser = {
        getUsers: function() {
            var result = {rows: [{first: "Nancy"}]}
            return Promise.resolve(result);
        },
        getUserMe: function() {
            var result = { first: "Nancy" };
            return Promise.resolve(result);
        },
        updateUserMe: function(){
            var result = { first: "Nancy" };
            return Promise.resolve(result);
       }
    } 

    
    var mockJwt = {
        getAuthParams: function(){
            var authParams = { cognitoClientId: "fakeCognitoClientId" }; 
            return authParams;
        },
        verifyToken: function(){
            var result = {"sub": "abcdefg"};
            return Promise.resolve(result);
        }
    }
    var server = proxyquire("../server", {
        "./user": mockUser,
        "./jwt" : mockJwt
    });
    it("health check", done => {
        chai
        .request(server)
        .get("/")
        .end((err, res) => {
            done();
        });
    });
    it("update user", done => {
        var body = { first: "Nancy" };
        chai
        .request(server)
        .put('/user/me')
        .send(body)
        .end((err, res) => {
            done();
        });
    });
    it("get users", done => {
        chai
        .request(server)
        .get("/users")
        .end((err, res) => {
            done();
        });
    });
    it("get user", done => {
        chai
        .request(server)
        .get("/user/me")
        .end((err, res) => {
            done();
        });
    });
});
describe("server error tests", () => {

    var mockUser = {
        getUsers: function() {
            var result = {message: "error"};
            return Promise.reject(result);
        },
        getUserMe: function() {
            var result = { message: "error" };
            return Promise.reject(result);
        },
        updateUserMe: function(){
            var result = { message: "error" };
            return Promise.reject(result);
       }
    }
    var mockJwt = {
        getAuthParams: function(){
            var authParams = { cognitoClientId: "fakeCognitoClientId" };
            return authParams;
        },
        verifyToken: function(){
            var result = {"sub": "abcdefg"};
            return Promise.resolve(result);
        }
    }

    var server = proxyquire("../server", {
        "./user": mockUser,
        "./jwt": mockJwt
    });
    it("update user", done => {
        var body = { first: "Nancy" };
        chai
        .request(server)
        .put('/user/me')
        .send(body)
        .end((err, res) => {
            done();
        });
    });
    it("get users", done => {
        chai
        .request(server)
        .get("/users")
        .end((err, res) => {
            done();
        });
    });
    it("get user", done => {
        chai
        .request(server)
        .get("/user/me")
        .end((err, res) => {
            done();
        });
    });
});

describe("server error with status code", () => {

    var mockUser = {
        getUsers: function() {
            var result = {statusCode: 401, message: "error"};
            return Promise.reject(result);
        }
    }

    var mockJwt = {
        getAuthParams: function(){
            var authParams = { cognitoClientId: "fakeCognitoClientId" };
            return authParams;
        },
        verifyToken: function(){
            var result = {"sub": "abcdefg"};
            return Promise.resolve(result);
        }
    }

    var server = proxyquire("../server", {
        "./user": mockUser,
        "./jwt": mockJwt
    });

    it("get users", done => {
        chai
        .request(server)
        .get("/users")
        .end((err, res) => {
            done();
        });
    });

});
