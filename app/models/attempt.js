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
  return Attempt;
};
