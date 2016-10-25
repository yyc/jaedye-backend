var secrets = require('../config/secrets.js');
var FacebookStrategy = require('passport-facebook-token');
var FB = require('fb');

module.exports = function(globals){
  var db = globals.db;
  var fb = new FB.Facebook({
    appId: secrets.facebook.clientID,
    appSecret: secrets.facebook.clientSecret,
  });
  globals.fb = fb;
  return new FacebookStrategy({
    clientID: secrets.facebook.clientID,
    clientSecret: secrets.facebook.clientSecret,
    callbackURL: secrets.url + '/auth/facebook/',
    profileFields: ['id', 'displayName', 'photos', 'email']
  }, function(accessToken, refreshToken, profile, cb){
    var photos = profile.photos;
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
      if(photos && photos.length){
        user.set('picture', photos[0].value);
      }

      // From https://www.npmjs.com/package/fb, exchange the short-lived access token for a long-lived one
      fb.api('oauth/access_token', {
          client_id: secrets.facebook.clientID,
          client_secret: secrets.facebook.clientSecret,
          grant_type: 'fb_exchange_token',
          fb_exchange_token: accessToken
      }, function (res) {
          if(!res || res.error) {
              console.log(!res ? 'error occurred' : res.error);
              return;
          }
          user.set('providerToken', res.access_token);
          user.save();
//          var expires = res.expires ? res.expires : 0;
      });

      return user.save();
    })
    .then(function(user){
      cb(null, user);
    });
  });
}
