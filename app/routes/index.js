var express = require('express');
var router = express.Router();

var auth = require('./auth');
var api = require('./api');

module.exports = function(globals){
  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });
  router.use('/auth/',auth(globals));
  router.get('/stat', function(req, res, next){
    globals.db.Attempt.findAll()
    .then(function(attempts){
      var total = attempts.reduce((total, attempt) => total + attempt.actualTime, parseInt(process.env.HOUR_OFFSET) || 0);
      res.json({total});
    })
  });
  router.use(globals.passport.authenticate('jwt', {session: false}));
  router.use('/api', api(globals));
  return router;
}
