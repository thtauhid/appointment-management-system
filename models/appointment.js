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
            [Op.lt]: endTime,
          },
          endTime: {
            [Op.gt]: startTime,
          },
        },
      })
    }

    static async getSuggestedTime(startTime, endTime) {
      const appointments = await Appointment.checkOverlappingAppointments(
        startTime,
        endTime
      )

      // convert startTime and endTime to Date objects
      startTime = new Date(startTime)
      endTime = new Date(endTime)

      // duration
      const duration = endTime.getTime() - startTime.getTime()

      let suggestedStartTime = startTime
      let suggestedEndTime = endTime

      // find the first available time slot
      for (let i = 0; i < appointments.length; i++) {
        const appointment = appointments[i]

        // convert appointment startTime and endTime to Date objects
        const appointmentStartTime = new Date(appointment.startTime)
        const appointmentEndTime = new Date(appointment.endTime)

        // check if the current appointment's startTime is greater than the previous appointment's endTime
        if (appointmentStartTime.getTime() > suggestedEndTime.getTime()) {
          break
        }

        // update the suggestedStartTime and suggestedEndTime
        suggestedStartTime = appointmentEndTime
        suggestedEndTime = new Date(appointmentEndTime.getTime() + duration)
      }

      return {
        startTime: suggestedStartTime,
        endTime: suggestedEndTime,
      }
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
