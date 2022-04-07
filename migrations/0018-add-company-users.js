'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'Clients',
            'company',
            Sequelize.STRING
        );
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.removeColumn(
            'Clients',
            'company'
        );
    }
};
