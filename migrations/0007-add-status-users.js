'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'Users',
            'associationStatus',
            {
                type: Sequelize.ENUM,
                values: ["Invite sent", "Invite accepted"]
            }
        );
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.removeColumn(
            'Users',
            'associationStatus'
        );
    }
};

