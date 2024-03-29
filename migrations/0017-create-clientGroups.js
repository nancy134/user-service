'use strict'
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('ClientGroups', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

            ClientId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Clients',
                    key: 'id'
                }
            },
            GroupId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Groups',
                    key: 'id'
                }
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('ClientGroups');
    }
};
