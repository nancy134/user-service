'use strict';
module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
        name: DataTypes.STRING
        
    }, {});


    return Client;
}