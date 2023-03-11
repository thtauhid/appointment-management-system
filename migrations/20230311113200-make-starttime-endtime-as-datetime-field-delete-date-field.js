'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    queryInterface.removeColumn('Appointments', 'startTime')
    queryInterface.removeColumn('Appointments', 'endTime')

    queryInterface.addColumn('Appointments', 'startTime', {
      type: Sequelize.DATE,
      allowNull: false,
    })

    queryInterface.addColumn('Appointments', 'endTime', {
      type: Sequelize.DATE,
      allowNull: false,
    })

    queryInterface.removeColumn('Appointments', 'date')
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    queryInterface.changeColumn('Appointments', 'startTime', {
      type: Sequelize.TIME,
      allowNull: false,
    })

    queryInterface.changeColumn('Appointments', 'endTime', {
      type: Sequelize.TIME,
      allowNull: false,
    })

    queryInterface.addColumn('Appointments', 'date', {
      type: Sequelize.DATE,
      allowNull: false,
    })
  },
}
