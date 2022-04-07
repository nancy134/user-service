'use strict';
module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
        UserId: DataTypes.INTEGER,
        first: DataTypes.STRING,
        last: DataTypes.STRING,
        email: DataTypes.STRING,
        mobilePhone: DataTypes.STRING,
        company: DataTypes.STRING
        
    }, {});

    Client.associate = function(models){
        Client.belongsTo(models.User, {as: 'user', foreignKey: 'UserId'});
        Client.belongsToMany(models.Group, {
            through: models.ClientGroup,
            as: 'groups',
            foreignKey: 'ClientId'
        });
    };
    return Client;
}
