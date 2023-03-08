require('dotenv').config()
const port = process.env.PORT || 3000

const express = require('express')
const app = express()
const path = require('path')
const flash = require('connect-flash')
const session = require('express-session')

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
    const { title, date, time, details } = req.body

    // Input validation
    if (!title || !date || !time) {
      // TODO: Send the previously entered data

      req.flash('error', 'Title, date and time are required')
      return res.redirect('/appointments')
    }

    const appointment = await Appointment.createAppointment({
      title,
      date,
      time,
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
  const appointments = await Appointment.getAllAppointments()
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
