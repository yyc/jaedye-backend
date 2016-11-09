var express = require('express');
var router = express.Router();

module.exports = function(globals){
  var db = globals.db;
  // router.get('/', function(req, res, next){
  //   req.user.model
  //   .then((user) => user.getFriends({isPending: false}))
  //   .then(function(friends){
  //     res.json(friends.map((friend) => friend.dataValues));
  //   });
  // });
  router.get('/', function(req, res, next){
    req.user.model
    .then(function(user){
      if(user.provider == 'facebook'){
        globals.fb.api(`me/friends`, {access_token: user.providerToken}, function(fbResponse){
          var friendsList = fbResponse.data.map((friend) => friend["id"]);
          db.User.findAll({
            where: {
              provider: 'facebook',
              providerId: {
                $in: friendsList
              }
            }
          })
          .then(function(userList){
            res.json({friends: userList.map((user) => user.getJSON())});
          });
        });
      }
    })
  });


  router.get('/leaderboard', function(req, res, next){
    var date = new Date();
    req.user.model
    .then(function(user){
      if(user.provider == 'facebook'){
        globals.fb.api(`me/friends`, {access_token: user.providerToken}, function(fbResponse){
          var friendsList = fbResponse.data.map((friend) => friend["id"]);
          db.User.findAll({
            where: {
              provider: 'facebook',
              providerId: {
                $in: friendsList
              }
            },
            include: {
              model: db.Attempt,
              where: {
                startTime : {
                  $gt: date.setDate(date.getDate() - 1)
                }
              }
            }
          })
          .then(function(userList){
            res.json({friends: userList.map((user) => {
              var duration = user.Attempts.reduce((total, attempt) => total + attempt.getDataValue('actualTime'), 0);
              return Object.assign(user.getJSON(), {duration});
              })});
          });
        });
      }
    })
  })
  // router.post('/', function(req, res, next){
  //   if(typeof req.body != 'number'){
  //     res.status(400);
  //     res.json({error: 'Post body is not a user ID'});
  //     return;
  //   }
  //   db.User.findById({id: req.body})
  //   .then(function(user){
  //     if(user == null){
  //       throw 'User not found!';
  //     }
  //     return db.Friendship.findOrCreate({
  //       where: { UserId: req.user.id },
  //       defaults: { friendTo: req.body }
  //     });
  //   })
  //   .spread(function(newFriendship, created){
  //     if(!created){
  //       throw 'User has already been added as friend!'
  //     }
  //     return db.Friendship.findOne({
  //       where: {friendTo: req.user.id,
  //               UserId: req.body}
  //     }).then(function(cFriendship){
  //       if(cFriendship == null){
  //         res.json({message: 'Friend request sent!'});
  //       } else{
  //         return Promise.all([
  //         newFriendship.update({isPending: false}),
  //         cFriendship.update({isPending: true})])
  //       }
  //     });
  //   })
  //   .spread(function(newFriendship, cFriendship){
  //     return cFriendship.getUser();
  //   })
  //   .then(function(user){
  //     res.json({
  //       message: "Friend added!",
  //       user: user.dataValues
  //     });
  //   }).catch(function(error){
  //     res.status(400);
  //     res.json({error});
  //   })
  //   ;
  // });
  return router;
}
