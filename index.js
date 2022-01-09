const express = require('express')

const app = express()
const portToListenTo = 3001

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

app.use(express.json())

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
