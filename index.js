require('dotenv').config()

const express = require('express')
const morgan = require('morgan')

const cors = require('cors')
const Person = require('./models/person')

const app = express()
const portToListenTo = process.env.PORT || 3001

let persons = []

app.use(morgan((tokens, request, response) => {
  const logLineComponents = [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'),
    '-',
    tokens['response-time'](request, response),
    'ms',
  ]

  if (request.method === 'POST') {
    logLineComponents.push(JSON.stringify(request.body))
  }

  return logLineComponents.join(' ')
}))

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => response.json(persons))
})

app.post('/api/persons', (request, response, next) => {
  const newPersonData = request.body
  
  if (!newPersonData.name || !newPersonData.number) {
    return response.status(400).json({
      error: !newPersonData.name ? 'name must be set' : 'number must be set'
    })
  }

  new Person({
    name: newPersonData.name,
    number: newPersonData.number
  }).save()
    .then(createdPerson => response.json(createdPerson))
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const personId = request.params.id

  Person
    .findById(personId)
    .then(person => response.json(person))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const personId = request.params.id
  const updatedPersonData = request.body

  const updatedFieldsForPerson = {
    name: updatedPersonData.name,
    number: updatedPersonData.number
  }

  Person
    .findByIdAndUpdate(personId, updatedFieldsForPerson, { new: true })
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const personId = request.params.id

  Person
    .findByIdAndRemove(personId)
    .then(() => response.status(204).end())
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person
    .countDocuments()
    .then(nbOfPersonsInDb => {
      response.send(`
        <p>Phonebook has info for ${nbOfPersonsInDb} people</p>
        <p>${new Date().toString()}</p>
      `)
    })
    .catch(error => next(error))

})

const errorHandler = (error, request, response, next) => {
  console.error(error)

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

app.listen(portToListenTo, () => {
  console.log(`Server running on port ${portToListenTo}`)
})
