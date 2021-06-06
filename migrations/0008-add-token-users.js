'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'Users',
            'associationToken',
            Sequelize.STRING
        );
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.removeColumn(
            'Users',
            'associationToken'
        );
    }
};
