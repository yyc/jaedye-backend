'use strict';
module.exports = function(sequelize, DataTypes) {
  var Challenge = sequelize.define('Challenge', {
    name: DataTypes.STRING,
    startDate: DataTypes.DATE,
    duration: DataTypes.INTEGER,
    description: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        this.hasMany(models.ChallengeUser);
        this.belongsToMany(models.User, {as: 'challengers', through: models.ChallengeUser});
      }
    }
  });
  return Challenge;
};
