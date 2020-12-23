const { verifyToken, getAuthParams, isAdmin } = require("../jwt");
const createJWKSMock = require("mock-jwks").default;
const { TokenExpiredError } = require("jsonwebtoken");
const { expect } = require('chai');
const MockExpressRequest = require('mock-express-request');

describe("Auth Test", () => {
    const jwks = createJWKSMock("https://cognito-idp.us-east-1.amazonaws.com/us-east-1_M0pJ75x7f");
    const jwksBad = createJWKSMock();
    const req = new MockExpressRequest({
        headers: {
            "Authorization": "Bearer token123abc",
            "com-sabresw-cognito-client-id": "52380a496h19smuev2kori3mtd",
            "com-sabresw-cognito-pool-id": "us-east-1_M0pJ75x7f"
        }
    });
    beforeEach(() => {
        process.env.AWS_REGION = "us-east-1";
        var authParams = getAuthParams(req);
        jwks.start();
    });

    afterEach(() => {
        delete process.env.AWS_REGION;
        jwks.stop();
    });

    it("not in Admin group", async () => {
        var jwtR = {};
        jwtR["cognito:groups"] = ["Admin"];
        isAdmin(jwtR);
        jwtR = {};
        jwtR["cognito:groups"] = ["Other"];
        isAdmin(jwtR);
        jwtR = {};
        isAdmin(jwtR);
    });
    it("check authParams", async () => {
        expect(authParams.IdToken).to.equal("token123abc");
    });
    it("valid token", async () => {
        const token = jwks.token({});
        authParams.IdToken = token;
        const data = await verifyToken(authParams);
        expect(data).to.deep.equal({});
    });
    it("expired token", async () => {
        const token = jwks.token({
            exp: 0
        });
        authParams.IdToken = token;
        try {
            const data = await verifyToken(authParams);
        } catch (error){
            expect(error.name).to.deep.equal(new TokenExpiredError("jwt expired").name);
        };
    });
    it("other 400 error", async () => {
        var invalidParams = {};
        try {
            const data = await verifyToken(invalidParams);
        } catch (error) {
        }; 
    });
    it("invalid key", async () => {
        const token = jwksBad.token({});
        authParams.IdToken = token;
        try {
            const data = await verifyToken(authParams);
        } catch (error){
        };
    });
});
