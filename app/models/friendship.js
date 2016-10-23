'use strict';
module.exports = function(sequelize, DataTypes) {
  var Friendship = sequelize.define('Friendship', {
    UserId: DataTypes.INTEGER,
    friendTo: DataTypes.INTEGER,
    isPending: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.User,{foreignKey: 'UserId', as: 'User'});
        this.belongsTo(models.User, {foreignKey: 'friendTo', as: 'Friend'});
      }
    }
  });
  return Friendship;
};
