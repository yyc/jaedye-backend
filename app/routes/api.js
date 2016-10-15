var express = require('express');
var router = express.Router();

var attempts = require('./attempts');

module.exports = function(globals){
  router.use(attempts(globals));
  return router;
}
