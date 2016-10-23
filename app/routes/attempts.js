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
    if(['startTime', 'actualTime', 'targetTime']
      .reduce((result, ind) => result && (req.body[ind] != undefined)), true){
        // One or more fields are missing
        res.status(400);
        res.json({error: 'Missing field in New Attempt object'});
        return;
    }
    var newObj = {
      startTime: req.body.startTime,
      actualTime: req.body.actualTime,
      targetTime: req.body.targetTime,
      UserId: req.user.id
    };
    db.Attempt.create(newObj)
    .then(function(newAttempt){
      res.end(newAttempt.id + '');
    });
  })
  return router;
}
