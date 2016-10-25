var express = require('express');
var router = express.Router();

module.exports = function(globals){
  var db = globals.db;

  // GET /api/challenges -- get list of all current challenges
  router.get('/', function(req, res, next){
    db.ChallengeUser
    .findAll({
      where:{
        UserId: req.user.id,
        isPending: false
      },
      order: ['isPending'],
      include:[db.Challenge]
    })
    req.user.model
    .then(function(challenges){
      res.json(friends.map((friend) => friend.dataValues));
    });
  });

  // POST /api/challenges  -- create new challenge
  router.post('/', function(req, res, next){
    if(!(['name', 'startDate', 'endDate','people']
      .reduce((result, ind) => result && (req.body[ind] != undefined), true))){
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
        where: {
          provider: 'facebook',
          providerId: {
            $in: friendsList
          }
        }
      })
    })
    .then(function(userList){
      console.log(userList);
      var users = userList.filter((user) => {
        // Filter out all the friends not in our list
        console.log(req.body.people, user.id, req.body.people.includes(user.id));
        return req.body.people.includes(user.id)});
      var challenge = db.Challenge.build({
        name: req.body.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      });
      return challenge.save()
      .then(function(challenge){
        challenge.setChallengers(users, {inviter: req.user.id});
        return req.user.model
        .then(function(user){
          challenge.addChallenger(req.user.__model, {isPending: false, });
          return challenge.save();
        });
      })
      .catch((err) => console.log('some problem with setChallengers'));
    })
    .then(function(challenge){
      res.json(challenge);
    })
    .catch(function(error){
      res.status(400);
      res.json({error});
    });
  });
  // GET /api/challenges/pending -- get invited challenges
  router.get('/pending', function(req, res, next){
    db.ChallengeUser
    .findAll({
      where:{
        UserId: req.user.id,
        isPending: false
      },
      order: ['isPending'],
      include:[db.Challenge]
    })
    .then(function(challengeUsers){
      res.json(friends.map((friend) => friend.dataValues));
    });
  });
  return router;
}
