'use strict';
module.exports = (sequelize, DataTypes) => {
    const ClientGroup = sequelize.define('ClientGroup', {
        ClientId: DataTypes.INTEGER,
        GroupId: DataTypes.INTEGER,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {});

    ClientGroup.associate = function(models){
        ClientGroup.belongsTo(models.Client, {as: 'client', foreignKey: 'ClientId'});
        ClientGroup.belongsTo(models.Group, {as: 'group', foreignKey: 'GroupId'});
    };

    return ClientGroup;
}
