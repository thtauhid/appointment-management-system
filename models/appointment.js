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
      return await Appointment.findAll({
        order: [['startTime', 'ASC']],
      })
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
      // convert startTime and endTime to Date objects
      startTime = new Date(startTime)
      endTime = new Date(endTime)

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
      const appointments = await Appointment.getAllAppointments()

      // convert startTime and endTime to Date objects
      startTime = new Date(startTime)
      endTime = new Date(endTime)

      // duration
      const duration = endTime.getTime() - startTime.getTime()

      let suggestedStartTime = startTime
      let suggestedEndTime = endTime

      // find the available time slot
      for (let i = 0; i < appointments.length; i++) {
        const appointment = appointments[i]
        const appointmentEndTime = new Date(appointment.endTime)

        // check if the current appointment is the last appointment
        if (i === appointments.length - 1) {
          // suggest the end time as suggestedstartTime
          suggestedStartTime = appointmentEndTime
          suggestedEndTime = new Date(suggestedStartTime.getTime() + duration)
          break
        } else {
          // if appointment is not the last one
          const nextAppointment = appointments[i + 1]

          // convert appointment startTime to Date objects
          const nextAppointmentStartTime = new Date(nextAppointment.startTime)

          // check the duration between the current appointment and the next appointment
          const durationBetweenAppointments =
            nextAppointmentStartTime.getTime() - appointmentEndTime.getTime()

          console.log({ duration, durationBetweenAppointments })
          // check if we have enough time to schedule the appointment
          if (durationBetweenAppointments >= duration) {
            suggestedStartTime = appointmentEndTime
            suggestedEndTime = new Date(suggestedStartTime.getTime() + duration)
            break
          }
        }
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
