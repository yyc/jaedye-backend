var express = require('express');
var router = express.Router();
var FB = require('fb');

module.exports = function(globals){
  var db = globals.db;
  router.get('/', function(req, res, next){
    req.user.model
    .then((user) => user.getFriends())
    .then(function(friends){
      res.json(friends.map((friend) => friend.dataValues));
    });
  });
  router.get('/new', function(req, res, next){
    req.user.model
    .then(function(user){

    })
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