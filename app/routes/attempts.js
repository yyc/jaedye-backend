var express = require('express');
var router = express.Router();

module.exports = function(globals){
  var db = globals.db;
  // GET /api/attempts -- Fetch all attempts for current user
  router.get('/', function(req, res, next){
    req.user.model
    .then((user) => user.getAttempts({limit: req.query.limit, offset: req.query.offset}))
    .then(function(attempts){
      res.json(attempts.map((attempt) => attempt.getDataValues(), attempts));
    });
  });
  return router;
}
