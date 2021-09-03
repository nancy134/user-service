'use strict';
module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
        first: DataTypes.STRING,
        last: DataTypes.STRING,
        email: DataTypes.STRING,
        mobilePhone: DataTypes.STRING
        
    }, {});

    Client.associate = function(models){
        Client.belongsTo(models.User, {as: 'user', foreignKey: 'UserId'});
    };
    return Client;
}