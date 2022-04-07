'use strict';
module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group', {
        name: DataTypes.STRING,
        UserId: DataTypes.INTEGER,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {});

    Group.associate = function(models){
        Group.belongsTo(models.User, {as: 'user', foreignKey: 'UserId'});
        Group.belongsToMany(models.Client, {
            through: models.ClientGroup,
            as: 'clients',
            foreignKey: 'GroupId'
        });
    };

    return Group;
}
