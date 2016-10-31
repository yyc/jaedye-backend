'use strict';
module.exports = function(sequelize, DataTypes) {
  var Attempt = sequelize.define('Attempt', {
    UserId: DataTypes.INTEGER,
    targetTime: DataTypes.INTEGER,
    actualTime: DataTypes.INTEGER,
    startTime: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.User);
      }
    }
  });
  Attempt.Instance.prototype.getEndTime = function(){
    return new Date(this.getDataValue("startTime").getTime() + this.getDataValue("actualTime")*60000);
  }
  Attempt.afterCreate(function(attempt, options){
    attempt.getUser()
    .then(function(user){
      return user.getActiveChallengesForAttempt(attempt)
    })
    .then(function(challengeUsers){
      // For each challenge, add the overlapping time (in minutes);
      challengeUsers.forEach(function(cu){
        var time = attempt.actualTime * 60000;
        time -= Math.max(cu.Challenge.startDate - attempt.startTime, 0);
        time -= Math.max(attempt.getEndTime() - cu.Challenge.endDate, 0);
        time = Math.round(time / 60000);
        cu.setDataValue("time", time);
        cu.save();
      })
    })
  })
  return Attempt;
};
