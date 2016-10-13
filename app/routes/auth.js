var express = require('express');


module.exports = function(globals){
  var db = globals.db;
  var passport = globals.passport;
  var jsonwebtoken = globals.jsonwebtoken;
  var router = express.Router();

  router.get('/facebook/redirect', passport.authenticate('facebook-token', {
    scope: ['email', 'publish_actions']
  }), function(req, res, next) {
    res.send('Facebook auth?');
  });
  router.get('/facebook', passport.authenticate('facebook-token', {
    failureRedirect: '/',
    session: false}), function(req, res, next) {
    var token = jsonwebtoken.sign(req.user.getJSON(), secrets.jwt.privateKey, {
      algorithm: secrets.jwt.algorithms[0]
    });
    res.set('access-token', token);
    res.send(JSON.stringify(req.user.dataValues));
  });


  return router;
}
