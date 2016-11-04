var express = require('express');
var router = express.Router();

var attempts = require('./attempts');
var friends = require('./friends');
var challenges = require('./challenges');

module.exports = function(globals){
  router.use('/attempts', attempts(globals));
  router.use('/friends', friends(globals));
  router.use('/challenges', challenges(globals));
  router.get('/image', function(req, res, next){
    res.json({
      image_url: process.env.IMAGE_URL || "https://jaedye.herokuapp.com/images/default.jpg",
      source: process.env.IMAGE_SOURCE || "Jaedye Team",
      source_url: process.env.IMAGE_SOURCE_URL || "https://jaedye.herokuapp.com"
    });
  });
  return router;
}
