var express = require('express');
var router = express.Router();

module.exports = function(globals){
  var db = globals.db;
  // GET /api/attempts -- Fetch all attempts for current user
  router.get('/', function(req, res, next){
    req.user.model
    .then((user) => user.getAttempts({limit: req.query.limit, offset: req.query.offset}))
    .then(function(attempts){
      res.json(attempts.map((attempt) => attempt.dataValues, attempts));
    });
  });
  router.post('/', function(req, res, next){
    var newObj = {
      startTime: req.body.startTime,
      actualTime: req.body.actualTime,
      targetTime: req.body.targetTime,
      UserId: req.user.id
    };
    db.Attempt.create(newObj)
    .then(function(newAttempt){
      res.end(newAttempt.id + '');
    })
  })
  return router;
}
