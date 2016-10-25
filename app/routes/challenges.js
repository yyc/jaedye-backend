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
      include:['Challenge', 'Inviter']
    })
    req.user.model
    .then((user) => user.getChallenges({isPending: false}))
    .then(function(friends){
      res.json(friends.map((friend) => friend.dataValues));
    });
  });

  router.post('/', function(req, res, next){
    if(typeof req.body != 'number'){
      res.status(400);
      res.json({error: 'Post body is not a user ID'});
      return;
    }
    db.User.findById({id: req.body})
    .then(function(user){
      if(user == null){
        throw 'User not found!';
      }
      return db.Friendship.findOrCreate({
        where: { UserId: req.user.id },
        defaults: { friendTo: req.body }
      });
    })
    .spread(function(newFriendship, created){
      if(!created){
        throw 'User has already been added as friend!'
      }
      return db.Friendship.findOne({
        where: {friendTo: req.user.id,
                UserId: req.body}
      }).then(function(cFriendship){
        if(cFriendship == null){
          res.json({message: 'Friend request sent!'});
        } else{
          return Promise.all([
          newFriendship.update({isPending: false}),
          cFriendship.update({isPending: true})])
        }
      });
    })
    .spread(function(newFriendship, cFriendship){
      return cFriendship.getUser();
    })
    .then(function(user){
      res.json({
        message: "Friend added!",
        user: user.dataValues
      });
    }).catch(function(error){
      res.status(400);
      res.json({error});
    })
    ;
  });
  return router;
}
