var SequelizeMock = require('sequelize-mock')
var { stub } = require('sinon');
var dbMock = new SequelizeMock();
var proxyquire = require('proxyquire');
const { makeMockModels } = require('sequelize-test-helpers');

describe("successful me tests", function() {
    var UserMock = dbMock.define('User', {
        first: "Nancy",
        last: "Piedra",
        cognitoId: "fakeCognitoId"
    });
    var models = {
        User: UserMock
    };
    var mockJwt = {
        verifyToken: function() {
            var result = {};
            result["cognito:username"] = "fakeCognitoId";
            result.sub = "abcdef";
            return Promise.resolve(result);
        }
    };

    var proxyquire = require("proxyquire");

    var userModule = proxyquire("../user", {
        "./models": models,
        "./jwt": mockJwt
    });


    it("getUserMe", function(done){
        userModule.getUserMe().then(function(result){
            done();
        })
    });
    it("updateUserMe", function(done){
        userModule.updateUserMe({first: "Nancy"}).then(function(result){
            done();
        }).catch(function(err){
            done()
        });
    });
});

describe("successful admin tests", function(){
    var UserMock = dbMock.define('User', {
        first: "Nancy",
        last: "Piedra",
        cognitoId: "fakeCognitoId"
    });
    var models = {
        User: UserMock
    };
    var mockJwt = {
        verifyToken: function() {
            var result = {};
            result["cognito:username"] = "fakeCognitoId";
            result["cognito:groups"] = ["Admin"];
            result.sub = "abcdef";
            return Promise.resolve(result);
        }
    };

    var proxyquire = require("proxyquire");

    var userModule = proxyquire("../user", {
        "./models": models,
        "./jwt": mockJwt
    });

    it ("getUsers", function(done){
        userModule.getUsers().then(function(result){
            done();
        });
    });

});

describe("successful system tests", function(){
    var UserMock = dbMock.define('User');
    var models = {
        User: UserMock
    };

    var proxyquire = require("proxyquire");

    var userModule = proxyquire("../user", {
        "./models": models
    });

    it("createUser", function(done){
        userModule.create({first:"Micahel"}).then(function(result){
            done();
        });
    });

});

describe("unsuccessful system tests", function(){
    var User = {
        findOrCreate: stub(),
        rawAttributes: {
            state: {
                values: []
            }
        }
    }
    var mockModels = makeMockModels({ User });

    var userModule = proxyquire("../user", {
        "./models": mockModels
    });
    before(() => {
        mockModels.User.findOrCreate.rejects("err");
    });

    it("createUser", function(done){
        userModule.create({first: "Michael"}).then(function(result){
        }).catch(function(err){
            done();
        });
    });
    it("getEnums", function(done){
        userModule.getEnums().then(function(result){
            done();
        });
    });


});
describe("unsuccessful me user tests", function(){
    var User = {
        findAndCountAll: stub(),
        findOne: stub(),
    }
    var mockModels = makeMockModels({ User });
    var mockJwt = {
        verifyToken: function() {
            var result = {};
            result["cognito:username"] = "fakeCognitoId";
            result.sub = "abcdef";
            return Promise.resolve(result);
        }
    };

    var userModule = proxyquire("../user", {
        "./models": mockModels,
        "./jwt": mockJwt
    });
    before(() => {
        mockModels.User.findAndCountAll.rejects("err");
        mockModels.User.findOne.rejects("err");
    });

    it('create user', function(done){
        userModule.create({first: "Nancy"}).then(function(result){
            done();
        }).catch(function(err){
            done();
        });
    });

    it('getUserMe', function(done){
        userModule.getUserMe().then(function(result){
        }).catch(function(err){
            done();
        });
    });
});

describe("unsuccessful admin user tests", function(){
    var User = {
        findAndCountAll: stub()
    }
    var mockModels = makeMockModels({ User });
    var mockJwt = {
        verifyToken: function() {
            var result = {};
            result["cognito:username"] = "fakeCognitoId";
            result["cognito:groups"] = ["Admin"];
            result.sub = "abcdef";
            return Promise.resolve(result);
        }
    };

    var userModule = proxyquire("../user", {
        "./models": mockModels,
        "./jwt": mockJwt
    });
    before(() => {
        mockModels.User.findAndCountAll.rejects("err");
    });

    it('get users', function(done){
        userModule.getUsers().then(function(result){
        }).catch(function(err){
            done();
        });
    });

});

describe("empty results", function(){
    var User = {
        findOne: stub(),
        update: stub()
    }
    var mockModels = makeMockModels({ User });

    var mockJwt = {
        verifyToken: function() {
            var result = {};
            result["cognito:username"] = "fakeCognitoId";
            result.sub = "abcdef";
            return Promise.resolve(result);
        }
    };

    var userModule = proxyquire("../user", {
        "./models": mockModels,
        "./jwt": mockJwt
    });
    before(() => {
        mockModels.User.findOne.resolves(undefined);
        mockModels.User.update.resolves([0]);
    });

    it('getUserMe', function(done){
        userModule.getUserMe().then(function(result){
            done();
        })
    });
    it('updateUserMe', function(done){
        userModule.updateUserMe().then(function(result){
            done();
        }).catch(function(err){
            done()
        });
    });
});

describe("invalid auth", function(){
    var User = {}
    var mockModels = makeMockModels({User});
    var mockJwt = {
        verifyToken: function(){
            return Promise.reject("err");
        }
    }
    var userModule = proxyquire("../user", {
        "./models": mockModels,
        "./jwt": mockJwt
    });
    it("getUserMe", function(done){
        userModule.getUserMe().then(function(result){
            done();
        }).catch(function(err){
            done();
        });
    });
    it("updateUserMe", function(done){
        userModule.updateUserMe().then(function(result){
            done();
        }).catch(function(err){
            done();
        });
    });
    it("getUsers", function(done){
        userModule.getUsers().then(function(result){
            done();
        }).catch(function(err){
            done();
        });
    });
});
describe("unsuccessful admin tests - not admin", function(){
    var UserMock = dbMock.define('User', {
        first: "Nancy",
        last: "Piedra",
        cognitoId: "fakeCognitoId"
    });
    var models = {
        User: UserMock
    };
    var mockJwt = {
        verifyToken: function() {
            var result = {};
            result["cognito:username"] = "fakeCognitoId";
            result.sub = "abcdef";
            return Promise.resolve(result);
        }
    };

    var proxyquire = require("proxyquire");

    var userModule = proxyquire("../user", {
        "./models": models,
        "./jwt": mockJwt
    });

    it ("getUsers", function(done){
        userModule.getUsers().then(function(result){
            done();
        });
    });

});

describe("update error", function(){
    var User = {
        findOne: stub(),
        update: stub()
    }
    var fakeUser = {
        id: 1,
        "first": "Nancy",
        get: function(){
            return {id: 1}
        }
    }
    var mockModels = makeMockModels({ User });
    var mockJwt = {
        verifyToken: function() {
            var result = {};
            result["cognito:username"] = "fakeCognitoId";
            result.sub = "abcdef";
            return Promise.resolve(result);
        }
    };

    var userModule = proxyquire("../user", {
        "./models": mockModels,
        "./jwt": mockJwt
    });
    before(() => {
        mockModels.User.update.rejects("err");
        mockModels.User.findOne.resolves(fakeUser);
    });
    it("updateUserMe", function(done){
        userModule.updateUserMe().then(function(result){
            done();
        }).catch(function(err){
            done();
        });
    });
});

