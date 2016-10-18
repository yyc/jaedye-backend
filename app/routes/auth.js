var express = require('express');
var secrets = require('../../config/secrets');

module.exports = function(globals){
  var db = globals.db;
  var passport = globals.passport;
  var jsonwebtoken = globals.jsonwebtoken;
  var router = express.Router();

  router.get('/facebook/redirect', function(req, res, next) {
    res.send(`<html><body><div id="fb-root"></div>\
<script>(function(d, s, id) {\
  var js, fjs = d.getElementsByTagName(s)[0];\
  if (d.getElementById(id)) return;\
  js = d.createElement(s); js.id = id;\
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8&appId=248444145553468";\
  fjs.parentNode.insertBefore(js, fjs);\
}(document, 'script', 'facebook-jssdk'));</script><div class="fb-login-button" data-max-rows="1" data-size="medium" data-show-faces="false" data-auto-logout-link="false"\
onlogin="function(){console.log(FB.getLoginStatus();)}"></div></body></html>`);
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
