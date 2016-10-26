var express = require('express');
var router = express.Router();

var attempts = require('./attempts');
var friends = require('./friends');
var challenges = require('./challenges');

module.exports = function(globals){
  router.use('/attempts', attempts(globals));
  router.use('/friends', friends(globals));
  router.use('/challenges', challenges(globals));
  return router;
}
