require('dotenv').config()
const port = process.env.PORT || 3000

const express = require('express')
const app = express()
const path = require('path')
const flash = require('connect-flash')
const session = require('express-session')
const moment = require('moment')

const { Appointment } = require('./models')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Flash
app.use(
  session({
    secret: 'asdfghjiuytredfvbnmjuytdmlkjgtredj',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
)
app.use(flash())

app.use((req, res, next) => {
  res.locals.messages = req.flash()
  next()
})

// Set view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  return res.redirect('/appointments')
})

app.post('/appointment', async (req, res) => {
  try {
    const { title, startTime, endTime, details } = req.body

    // Input validation
    if (!title || !startTime || !endTime) {
      // TODO: Send the previously entered data

      req.flash('error', 'Title, start time and end time are required')
      return res.redirect('/appointments')
    }

    // TODO: check if start time is less than end time

    // Check if time is overlapping
    let overlappingAppointments =
      await Appointment.checkOverlappingAppointments(startTime, endTime)

    if (overlappingAppointments.length > 0) {
      req.flash(
        'error',
        'The time you entered is overlapping with another appointment.'
      )

      // go over the overlapping appointments and format the time
      overlappingAppointments = overlappingAppointments.map((appointment) => {
        return {
          title: appointment.title,
          details: appointment.details,
          startTime: moment(appointment.startTime).format(
            'hh:mm A (DD MMMM YY)'
          ),
          endTime: moment(appointment.endTime).format('hh:mm A (DD MMMM YY)'),
        }
      })

      // send the overlapping appointments and the current appointment
      const currentAppointment = {
        title,
        startTime,
        endTime,
        details,
      }

      // Get a suggested time
      const suggestedTime = await Appointment.getSuggestedTime(
        startTime,
        endTime
      )

      const suggestedAppointment = {
        title,
        startTime: moment(suggestedTime.startTime).format(
          'hh:mm A (DD MMMM YY)'
        ),
        endTime: moment(suggestedTime.endTime).format('hh:mm A (DD MMMM YY)'),
        details,
      }

      return res.render('overlap', {
        overlappingAppointments,
        currentAppointment,
        suggestedAppointment,
      })
    }

    const appointment = await Appointment.createAppointment({
      title,
      startTime,
      endTime,
      details,
    })

    if (!appointment) {
      req.flash('error', 'Unable to create appointment')
      return res.status(400).send('Appointment not created')
    }

    req.flash('success', 'Appointment created successfully')
    return res.redirect('/appointments')
  } catch (error) {
    req.flash('error', 'Unable to create appointment')
    return res.redirect('/appointments')
  }
})

app.get('/appointments', async (req, res) => {
  let appointments = await Appointment.getAllAppointments()

  // Format the time
  appointments = appointments.map((appointment) => {
    return {
      title: appointment.title,
      details: appointment.details,
      startTime: moment(appointment.startTime).format('hh:mm A (DD MMMM YY)'),
      endTime: moment(appointment.endTime).format('hh:mm A (DD MMMM YY)'),
    }
  })

  return res.render('index', { appointments })
})

app.patch('/appointment/:id', async (req, res) => {
  try {
    const { id } = req.params
    let { title, details } = req.body

    // Trim input
    title = title.trim()
    details = details.trim()

    // Input validation
    if (!title) {
      req.flash('error', 'Title is required')
      return res.send({
        success: false,
        message: 'Title is required',
      })
    }

    const appointment = await Appointment.updateAppointmentById(id, {
      title,
      details,
    })

    if (!appointment) {
      req.flash('error', 'Unable to update appointment')
      return res.send({
        success: false,
        message: 'Unable to update appointment',
      })
    }

    req.flash('success', 'Appointment updated successfully')
    return res.send({
      success: true,
      message: 'Appointment updated successfully',
    })
  } catch (error) {
    req.flash('error', 'Unable to update appointment')
    return res.send({
      success: false,
      message: 'Unable to update appointment',
    })
  }
})

app.get('/appointment/edit/:id', async (req, res) => {
  const { id } = req.params
  const appointment = await Appointment.getAppointmentById(id)

  if (!appointment) {
    req.flash('error', 'Appointment not found')
    return res.redirect('/appointments')
  }

  return res.render('edit-appointment', { appointment })
})

app.delete('/appointment/:id', async (req, res) => {
  try {
    const { id } = req.params

    const appointment = await Appointment.getAppointmentById(id)

    if (!appointment) {
      req.flash('error', 'Appointment not found')
      return res.redirect('/appointments')
    }

    const deletedAppointment = await Appointment.deleteAppointmentById(id)

    if (!deletedAppointment) {
      req.flash('error', 'Unable to delete appointment')
      return res.status(400).send('Appointment not deleted')
    }

    req.flash('info', 'Appointment deleted successfully')
    return res.status(200).send({ success: true })
  } catch (error) {
    req.flash('error', 'Unable to delete appointment')
    return res.status(400).send('Appointment not deleted')
  }
})

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})
