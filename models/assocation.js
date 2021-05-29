'use strict';
module.exports = (sequelize, DataTypes) => {
    const Association = sequelize.define('Association', {
        name: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {});

    Association.associate = function(models){
        Association.hasMany(models.User, {as: 'users'});
    };
 
    return Association;
}
