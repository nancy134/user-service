const jwt = require('jsonwebtoken');
const rp = require('request-promise');
const jwkToPem = require('jwk-to-pem');

exports.verifyToken = function(token){
    return new Promise(function(resolve, reject) {
        var decodedJwt = jwt.decode(token, {complete: true});

        // Compare client id
        if (decodedJwt.payload.aud === process.env.COGNITO_CLIENT_ID){
        } else {
            var err = {status: "failed"};
            reject(err);
        }

        // Compare issuer
        var issuerUrl = "https://cognito-idp." +
                        process.env.AWS_REGION +
                        ".amazonaws.com/" +
                        process.env.COGNITO_POOL_ID;
                        
        if (decodedJwt.payload.iss === issuerUrl){
        }else{
            var err = {status: "failed"};
            reject();
        }

        var url = "https://cognito-idp." +
                  process.env.AWS_REGION +
                  ".amazonaws.com/" +
                  process.env.COGNITO_POOL_ID +
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
                    reject(err);
                } else {
                    resolve({status: "verified"});
                }
            }); 
        })
        .catch(function(err){
            reject(err);
        });
     });
}
