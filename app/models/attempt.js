'use strict';
module.exports = function(sequelize, DataTypes) {
  var Attempt = sequelize.define('Attempt', {
    user: DataTypes.INTEGER,
    goalTime: DataTypes.INTEGER,
    actualTime: DataTypes.INTEGER,
    startTime: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Attempt;
};