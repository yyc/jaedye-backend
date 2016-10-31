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
  return Attempt;
};
