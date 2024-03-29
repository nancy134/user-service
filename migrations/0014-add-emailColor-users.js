'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'Users',
            'emailColor',
            Sequelize.STRING
        );
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.removeColumn(
            'Users',
            'emailColor'
        );
    }
};
