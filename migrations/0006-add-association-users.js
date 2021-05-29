module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'Users',
      'AssociationId',
      {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
              model: 'Associations',
              key: 'id'
          }
       }
    );

  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'Users',
      'AssociationId'
    );
  }
}
