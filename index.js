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

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})
