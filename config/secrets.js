var fs = require('fs');

// Initialization: Getting encryption keys for JWT
try {
  var publicKey = fs.readFileSync('jwtKey.pub')
} catch(e) {
  var publicKey = process.env.JWT_PUBLIC_KEY
}
try {
  var privateKey = fs.readFileSync('jwtKey')
} catch(e) {
  var privateKey = process.env.JWT_PRIVATE_KEY
}

var jwtSecret = process.env.JWT_SYMMETRIC_KEY || "f8f8a36e07f65c1788abe73f7a1afe7086c46163df3824cd7574779c40f70568fb7a1e323ddb1aec20d89a193404b6fc5bac574d80db722e04fea83dcc6dfcfb";
// symmetric algorithms
var algorithms = ['HS384', 'HS512'];


if(publicKey && privateKey){
  console.log("RSA Public/Private key pair found, using.");
  algorithms = ['RS384', 'RS512'];

} else if(publicKey || privateKey){
  console.log("Only one key found, using key as symmetric");
  publicKey = publicKey || privateKey;
  privateKey = publicKey || privateKey;
}
 else{
  console.log("No keys found, using default symmetric key");
  publicKey = jwtSecret;
  privateKey = jwtSecret;
}

module.exports = {
  facebook: {
    appId: process.env.FACEBOOK_ID || "FBIDHere",
    appSecret: process.env.FACEBOOK_SECRET || "FBSecretHere"
  },
  google: {
    clientID: process.env.GOOGLE_ID || "GOOGIDHere",
    clientSecret: process.env.GOOGLE_SECRET || "GOOGSecretHere"
  },
  jwt: {
    algorithms,
    publicKey,
    privateKey
  },
  url: process.env.URL || 'http://localhost:3000'
}
