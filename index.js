require('dotenv').config()
const port = process.env.PORT || 3000

const express = require('express')
const app = express()
const path = require('path')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Set view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  return res.render('index')
})

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})
