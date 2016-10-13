var secrets = require('./secrets');

var jsonwebtoken = require("jsonwebtoken");
var passportJwt = require('passport-jwt');
  var JwtStrategy = passportJwt.Strategy;
  var jwtExtractors = passportJwt.ExtractJwt;

module.exports = function(db){
  var strategy = new JwtStrategy({
      secretOrKey: secrets.jwt.publicKey,
      jwtFromRequest: jwtExtractors.fromHeader('access-token'),
      algorithms: secrets.jwt.algorithms,
      session: false
    }, function(user, done){
      done(null, new LazyUser(user));
    }
  );
  return {
    strategy,
    jsonwebtoken
  }
}

// Optimization for JWT, so we only hit the DB for the actual user model when we need it
class LazyUser {
  constructor(userJson){
    Object.assign(this, userJson);
    this.__model = undefined;
  }
  get model(){
    if(this.__model){
      return Promise.resolve(this.__model);
    }
    else {
      return db.User.findById(this.id);
    }
  }
}
