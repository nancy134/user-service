'use strict';
module.exports = (sequelize, DataTypes) => {
    const Smartcar = sequelize.define('Smartcar', {
        UserId: DataTypes.INTEGER,
        accessToken: DataTypes.STRING,
        refreshToken: DataTypes.STRING,
        expiration: DataTypes.STRING,
        refreshExpiration: DataTypes.STRING

    }, {});

    Smartcar.associate = function(models){
        Smartcar.belongsTo(models.User, {as: 'user', foreignKey: 'UserId'});
    };
    return Smartcar;
}