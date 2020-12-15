const jwt = require('jsonwebtoken');
const rp = require('request-promise');
const jwkToPem = require('jwk-to-pem');

exports.getToken = function(req){
    var authorization = req.get("Authorization");
    var array = authorization.split(" ");
    var IdToken = array[1];
    return IdToken;
}

exports.verifyToken = function(token, cognitoClientId, cognitoPoolId){
    return new Promise(function(resolve, reject) {
        var decodedJwt = jwt.decode(token, {complete: true});
        // Compare client id
        if (decodedJwt.payload.aud === cognitoClientId){
        } else {
            var err = {
                statusCode: 400,
                code: "InvalidCognitoClientId",
                message: "Cognito Client id does not match"
            };
            reject(err);
        }

        // Compare issuer
        var issuerUrl = "https://cognito-idp." +
                        process.env.AWS_REGION +
                        ".amazonaws.com/" +
                        cognitoPoolId;
                        
        if (decodedJwt.payload.iss === issuerUrl){
        }else{
            var err = {
                statusCode: 400,
                code: "InvalidIssuerURL",
                message: "Issuer URL does not match"
            };
            reject(err);
        }

        var url = "https://cognito-idp." +
                  process.env.AWS_REGION +
                  ".amazonaws.com/" +
                  cognitoPoolId +
                  "/.well-known/jwks.json"
        var options = {
            uri: url,
            json: true
        };
        rp(options)
        .then(function(jwk){

            var jsonbody = JSON.stringify(jwk);
            var obj = JSON.parse(jsonbody);

            var key = obj.keys.find(key => {
                return key.kid = decodedJwt.header.kid
            });
            var pem = jwkToPem(key);

            jwt.verify(token, pem, function(err, decoded) {
                if (err) {
                    var returnErr = {};
                    if (err.name === "TokenExpiredError"){
                        returnErr = {
                            statusCode: 401,
                            code: err.name,
                            message: "Token expired"
                        };
                        reject(returnErr);
                    } else {
                        return Err = {
                            statusCode: 400,
                            code: err.name,
                            message: err.message
                        };
                        reject(returnErr);
                    }
                } else {
                    resolve(decoded);
                }
            }); 
        })
        .catch(function(err){
            reject(err);
        });
     });
}
