'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'Users',
            'optout',
            Sequelize.BOOLEAN
        );
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.removeColumn(
            'Users',
            'optout'
        );
    }
};
