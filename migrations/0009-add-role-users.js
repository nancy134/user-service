'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'Users',
            'role',
            {
                type: Sequelize.ENUM,
                values: ['Agent', 'Broker', 'Administrator', 'Principal', 'Client']
            }
        );
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.removeColumn(
            'Users',
            'role'
        );        
    }
};
