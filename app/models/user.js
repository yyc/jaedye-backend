'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    picture: DataTypes.STRING,
    provider: DataTypes.STRING,
    providerId: DataTypes.STRING,
    providerToken: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        this.hasMany(models.Attempt);
      }
    }
  });
  User.Instance.prototype.getJSON = function(){
    return {
      id: this.getDataValue('id'),
      name: this.getDataValue('name'),
      email: this.getDataValue('email')
    };
  }
  return User;
};
