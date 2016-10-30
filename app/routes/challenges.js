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
      },
      order: ['isPending'],
      include:[{model: db.Challenge, include: [{model: db.ChallengeUser, as: 'ChallengeUsers', include: [db.User]}],
       order:[db.ChallengeUser, 'time']},
       {model: db.User, as: 'Inviter'}]
    })
    .then(function(challengeUsers){
      res.json({challenges: challengeUsers.map(function(cu){
        return {id: cu.ChallengeId,
          name: cu.Challenge.name,
          startDate: cu.Challenge.startDate,
          endDate: cu.Challenge.endDate,
          accepted: !cu.isPending,
          inviter: cu.Inviter ? {
            id: cu.Inviter.id,
            name: cu.Inviter.name,
            picture: cu.Inviter.picture,
            email: cu.Inviter.email
          }: null,
          challengers: cu.Challenge.ChallengeUsers.map(function(cu){
            return {picture: cu.User.picture.replace("?type=large","") + "?type=small",
                    time: cu.time};
          })
        };
      })});
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
        challenge.setChallengers(users, {inviter: req.user.id, isPending: true});
        return req.user.model
        .then(function(user){
          challenge.addChallenger(user, {isPending: false, });
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
        isPending: true
      },
      order: ['isPending'],
      include:[db.Challenge, {model: db.User, as: 'Inviter'}]
    })
    .then(function(challengeUsers){
      res.json({challenges: challengeUsers.map(function(cu){
        return {id: cu.ChallengeId,
        name: cu.Challenge.name,
        startDate: cu.Challenge.startDate,
        endDate: cu.Challenge.endDate,
        inviter: {
          id: cu.Inviter.id,
          name: cu.Inviter.name,
          picture: cu.Inviter.picture,
          email: cu.Inviter.email
          }
        };
      })});
    });
  });

  // GET /api/challenges/:id -- Get challenge info
  router.get('/:id', function(req, res, next){
    req.params.id = Number(req.params.id);
    if(typeof req.params.id != 'number'){
      res.status(400);
      res.json({error: 'Challenge ID is not a number'});
      return;
    }
    db.ChallengeUser.findOne({
      where:{
        ChallengeId: req.params.id,
        UserId: req.user.id
      },
      include: [db.Challenge]
    })
    .then(function(cu){
      if(cu == null){
        res.status(404);
        res.json({error: 'Challenge not found for current user'});
      } else{
        return Promise.all([Promise.resolve(cu.Challenge), cu.Challenge.getChallengeUsers({
          include: [db.User],
          order: [['time', 'DESC']]
        })]);
      }
    })
    .spread(function(challenge, challengeUsers){
      res.json({id: challenge.id,
        name: challenge.name,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        leaderboard: challengeUsers.map(function(cu){
          return {
              id: cu.User.id,
              name: cu.User.name,
              email: cu.User.email,
              picture: cu.User.picture,
              duration: cu.time
            };
        }),
      })
    });
  });

  // POST /api/challenges/:id/accept -- accept challenge
  router.post('/:id/accept', function(req, res, next){
    req.params.id = Number(req.params.id);
    if(typeof req.params.id != 'number'){
      res.status(400);
      res.json({error: 'Challenge ID is not a number'});
      return;
    }
    db.ChallengeUser.findOne({
      where:{
        ChallengeId: req.params.id,
        UserId: req.user.id
      },
      include: [db.Challenge]
    })
    .then(function(cu){
      if(cu == null){
        res.status(404);
        res.json({error: 'Challenge not found for current user'});
      } else{
        if(cu.getDataValue("isPending")){
          cu.setDataValue('isPending', false);
          return cu.save();
        } else{
          res.status(304);
        }
      }
    })
    .then(function(cu){
      if(cu){
        res.json(cu.Challenge);
      } else{
        res.end();
      }
    });
  });
  // POST /api/chalenges/:id/decline -- decline/quit challenge
  router.post('/:id/decline', function(req, res, next){
    req.params.id = Number(req.params.id);
    if(typeof req.params.id != 'number'){
      res.status(400);
      res.json({error: 'Challenge ID is not a number'});
      return;
    }
    db.ChallengeUser.findOne({
      where:{
        ChallengeId: req.params.id,
        UserId: req.user.id
      },
      include: [db.Challenge]
    })
    .then(function(cu){
      if(cu == null){
        res.status(404);
        res.json({error: 'Challenge not found for current user'});
      } else{
        if(cu.getDataValue("isPending")){
          res.json({message: "Challenge declined."});
          return cu.destroy();
        } else{
          res.json({message: "Challenge successfully exited."});
          return cu.destroy();
        }
      }
    })
  });
  return router;
}
