var passport = require('passport');

module.exports = function(globals){
  var jwt = require('./jwt')(globals);
  var facebook = require('./facebook')(globals);
  // Define JWT strategy
  passport.use(jwt.strategy);
  passport.use(facebook);
  return Object.assign(globals,{
    jsonwebtoken: jwt.jsonwebtoken,
    passport
  });
}
