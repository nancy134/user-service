'use strict';
const sns = require('../sns');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: DataTypes.STRING,
        cognitoId: DataTypes.STRING,
        first: DataTypes.STRING,
        last: DataTypes.STRING,
        middle: DataTypes.STRING,
        company: DataTypes.STRING,
        title: DataTypes.STRING,
        address1: DataTypes.STRING,
        address2: DataTypes.STRING,
        city: DataTypes.STRING,
        state: { 
            type: DataTypes.ENUM,
            values: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
        },
        zip: DataTypes.STRING,
        bio: DataTypes.TEXT,
        officePhone: DataTypes.STRING,
        mobilePhone: DataTypes.STRING,
        optout: DataTypes.BOOLEAN,
        associationStatus: {
            type: DataTypes.ENUM,
            values: ["Invite sent", "Invite accepted"]
        },
        associationToken: DataTypes.STRING,
        role: {
            type: DataTypes.ENUM,
            values: ['Agent', 'Broker', 'Administrator', 'Principal', 'Client']
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, 
    {
        hooks: {
            afterBulkUpdate: function(user){
                var userData = user.attributes;
                userData.id = user.where.id;
                sns.updateUserEvent(userData);
            }
        } 
    });

    User.associate = function(models){
        User.belongsTo(models.Association, {as: 'association', foreignKey: 'AssociationId'});
    };

    return User;
}
