'use strict';
module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
        name: DataTypes.STRING
        
    }, {});

    Client.associate = function(models){
        Client.belongsTo(models.User, {as: 'user', foreignKey: 'UserId'});
    };
    return Client;
}