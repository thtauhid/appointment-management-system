'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static async createAppointment(appointment) {
      return await Appointment.create(appointment)
    }

    static async getAllAppointments() {
      return await Appointment.findAll()
    }

    static async getAppointmentById(id) {
      return await Appointment.findByPk(id)
    }

    static async updateAppointmentById(id, appointment) {
      return await Appointment.update(appointment, {
        where: { id },
      })
    }

    static async deleteAppointmentById(id) {
      return await Appointment.destroy({
        where: { id },
      })
    }
  }
  Appointment.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      details: {
        type: DataTypes.TEXT,
        trim: true,
      },
    },
    {
      sequelize,
      modelName: 'Appointment',
    }
  )
  return Appointment
}
