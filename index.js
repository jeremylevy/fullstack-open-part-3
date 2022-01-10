const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const portToListenTo = process.env.PORT || 3001

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

const randomNumberBetweenInterval = (min, max) => (
  Math.floor(Math.random() * (max - min + 1) + min)
)

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

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.post('/api/persons', (request, response) => {
  const newPersonData = request.body
  let badRequestErrorMessage = null

  if (!newPersonData.name || !newPersonData.number) {
    badRequestErrorMessage = !newPersonData.name ? 'name must be set' : 'number must be set'
  }

  const personWithThisName = persons.find(person => person.name === newPersonData.name)

  if (personWithThisName) {
    badRequestErrorMessage = 'name must be unique'
  }

  if (badRequestErrorMessage) {
    return response.status(400).json({
      error: badRequestErrorMessage
    })
  }

  const newPerson = {
    id: randomNumberBetweenInterval(0, 1e6),
    name: newPersonData.name,
    number: newPersonData.number
  }

  persons = [...persons, newPerson]

  response.json(newPerson)
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
