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

app.post('/api/persons', (request, response) => {
  const newPersonData = request.body
  
  if (!newPersonData.name || !newPersonData.number) {
    return response.status(400).json({
      error: !newPersonData.name ? 'name must be set' : 'number must be set'
    })
  }

  new Person({
    name: newPersonData.name,
    number: newPersonData.number
  }).save().then(createdPerson => response.json(createdPerson))
})

app.get('/api/persons/:id', (request, response) => {
  const personId = Number(request.params.id)
  const person = persons.find(person => person.id === personId)

  if (!person) {
    return response.status(404).end()
  }

  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const personId = Number(request.params.id)
  const personToDelete = persons.find(person => person.id === personId)

  if (!personToDelete) {
    return response.status(404).end()
  }

  persons = persons.filter(person => person !== personToDelete)

  response.status(204).end()
})

app.get('/info', (request, response) => {
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date().toString()}</p>
  `)
})

app.listen(portToListenTo, () => {
  console.log(`Server running on port ${portToListenTo}`)
})
