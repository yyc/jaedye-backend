var secrets = require('../config/secrets.js');
var FacebookStrategy = require('passport-facebook-token');

module.exports = function(globals){
  var db = globals.db;
  return new FacebookStrategy({
    clientID: secrets.facebook.clientID,
    clientSecret: secrets.facebook.clientSecret,
    callbackURL: secrets.url + '/auth/facebook/',
    profileFields: ['id', 'displayName', 'photos', 'email']
  }, function(accessToken, refreshToken, profile, cb){
    db.User.findOrCreate({
        where: {
          provider: 'facebook',
          providerId: profile.id
        },
        defaults: {
          email: profile.email
        }
      })
    .spread(function(user, wasCreated){
      user.set('providerToken', accessToken);
      user.set('name', profile.displayName);
      return user.save();
    })
    .then(function(user){
      cb(null, user);
    });
  });
}
