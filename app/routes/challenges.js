var express = require('express');
var router = express.Router();

module.exports = function(globals){
  var db = globals.db;

  router.get('/', function(req, res, next){
    db.ChallengeUser
    .findAll({
      where:{
        UserId: req.user.id
      },
      order: ['isPending'],
      include:[db.Challenge, 'Inviter']
    })
    req.user.model
    .then((user) => user.getChallenges({isPending: false}))
    .then(function(friends){
      res.json(friends.map((friend) => friend.dataValues));
    });
  });

  // POST /api/challenges  -- create new challenge
  router.post('/', function(req, res, next){
    if(['name', 'startDate', 'endDate','people']
      .reduce((result, ind) => result && (req.body[ind] != undefined)), true){
        // One or more fields are missing
        res.status(400);
        res.json({error: 'Missing field in New Challenge object'});
        return;
    }
    req.user.model
    .then(function(user){
      return new Promise(function(resolve, reject){
          globals.fb.api(`me/friends`, {access_token: user.providerToken}, function(fbResponse){
            var friendsList = fbResponse.data.map((friend) => friend["id"]);
            resolve(friendsList);
          });
      });
    })
    .then(function(friendsList){
      return db.User.findAll({
        provider: 'facebook',
        providerId: friendsList
      })
    })
    .then(function(userList){
      var users = userList.filter((user) => req.body.people.includes(user.id));
      return db.Challenge.build({
        name: req.body.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        challengers: users
      });
    })
    .then(function(challenge){
      res.json(challenge);
    })
    .catch(function(error){
      res.status(400);
      res.json({error});
    });
  });
  return router;
}
