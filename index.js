require('dotenv').config()
const port = process.env.PORT || 3000

const express = require('express')
const app = express()
const path = require('path')

const { Appointment } = require('./models')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Set view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  return res.redirect('/appointments')
})

app.post('/appointment', async (req, res) => {
  try {
    const { title, date, time, location, details } = req.body

    const appointment = await Appointment.createAppointment({
      title,
      date,
      time,
      location,
      details,
    })
    if (!appointment) return res.status(400).send('Appointment not created')
    return res.redirect('/')
  } catch (error) {
    return res.status(500).send('Server error')
  }
})

app.get('/appointments', async (req, res) => {
  const appointments = await Appointment.getAllAppointments()
  console.log(appointments)
  return res.render('index', { appointments })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})
