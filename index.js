const express = require('express')
const server = express()
server.use(express.json())
server.use(express.static('dist'))

const logger = require('morgan')
logger.token('data', function (req) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})
server.use(logger(':method :url :status :res[content-length] - :response-time ms :data'))

const allowCrossOrigin = require('cors')
server.use(allowCrossOrigin())

const Person = require('./models/person')

server.get('/api/persons', (_, res) => {
  Person.find({}).then(result => {
    res.json(result)
  })
})

server.get('/api/info', (_, res) => {
  Person.find({}).then(result => {
    const now = new Date()
    res.send(`Phonebook has info for ${result.length} people <br/><br/> ${now.toString()}`)
  })
})

server.delete('/api/persons/:id', (req, res, next) => {
  Person.deleteOne({ '_id': req.params.id }).then(() => {
    res.status(204).end()
  }).catch(error => next(error))
})

server.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(result => {
    if (result) {
      res.json(result)
    } else {
      res.status(404).end()
    }
  }).catch(error => next(error))
})

server.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  Person.findByIdAndUpdate(req.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      if (updatedPerson === null) {
        const err = Error('Person does not exist')
        err.name = 'DoesNotExistError'
        throw err
      }
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

server.post('/api/persons', (req, res, next) => {
  const newPerson = structuredClone(req.body)
  Person.find({}).then(existingPersons => {
    if ((!Object.keys(newPerson).includes('name') || !Object.keys(newPerson).includes('number')) || (newPerson.name === null || newPerson.number === null || newPerson.name === '' || newPerson.number === '')){
      const err = new Error('Missing Number/Name')
      err.name = 'MissingNameNumber'
      return next(err)
    } else if (existingPersons.filter(p => p.name === newPerson.name).length > 0) {
      const err = new Error('Non Unique Number/Name')
      err.name = 'NonUniqueNN'
      return next(err)
    }
    const personToSave = new Person({
      name: newPerson.name,
      number: newPerson.number
    })
    personToSave.save().then(savedPerson => {
      res.json(savedPerson)
    }).catch(error => next(error))
  })
})

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'NonUniqueNN') {
    return res.status(400).send({ error: 'name must be unique' })
  } else if (error.name === 'MissingNameNumber') {
    return res.status(400).send({ error: 'missing name or number' })
  } else if (error.name === 'DoesNotExistError') {
    return res.status(404).json({ error: 'person requested does not exist' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ type: 'valErr', error: error.message })
  }

  next(error)
}
server.use(errorHandler)

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
