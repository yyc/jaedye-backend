var passport = require('passport');

module.exports = function(db){
  var jwt = require('./jwt')(db);
  // Define JWT strategy
  passport.use(jwt.strategy);
  return passport;
}
