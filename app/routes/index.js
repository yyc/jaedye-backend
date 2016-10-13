var express = require('express');
var router = express.Router();

var auth = require('./auth');

module.exports = function(globals){
  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });
  router.use('/auth/',auth(globals));

  return router;
}
