'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    provider: DataTypes.STRING,
    providerId: DataTypes.STRING,
    providerToken: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  User.prototype.getJSON(){
    return {
      id: this.getDataValue('id'),
      name: this.getDataValue('name'),
      email: this.getDataValue('email')
    };
  }
  return User;
};
