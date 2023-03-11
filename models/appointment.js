'use strict'
const { Model, Op } = require('sequelize')
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

    static async checkOverlappingAppointments(startTime, endTime) {
      return await Appointment.findAll({
        where: {
          startTime: {
            [Op.lte]: endTime,
          },
          endTime: {
            [Op.gte]: startTime,
          },
        },
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
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.DATE,
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
