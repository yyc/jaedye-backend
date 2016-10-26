'use strict';
module.exports = function(sequelize, DataTypes) {
  var ChallengeUser = sequelize.define('ChallengeUser', {
    ChallengeId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER,
    time: DataTypes.INTEGER,
    isPending: DataTypes.BOOLEAN,
    inviter: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.User);
        this.belongsTo(models.Challenge);
        this.belongsTo(models.User, {as: 'Inviter', foreignKey: 'inviter'});
      }
    }
  });
  return ChallengeUser;
};
