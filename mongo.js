const mongoClient = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument')
  process.exit(1)
}

mongoClient.set('strictQuery', false)
mongoClient.connect(`mongodb+srv://slowfinger00:${process.env.MONGO_PASSWORD}@fullstack.phdfxec.mongodb.net/?retryWrites=true&w=majority&appName=fullstack`)
mongoClient.connection.useDb('phonebookPart3')

const personSchema = new mongoClient.Schema({
  name: String,
  number: String,
})

const Person = mongoClient.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({}).then(contacts => {
    console.log('Phonebook:')
    contacts.forEach(contact => {
      console.log(`${contact.name} ${contact.number}`)
    })
    mongoClient.connection.close()
  })
} else if (process.argv.length === 5) {
  const newPerson = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })
  newPerson.save().then(() => {
    console.log(`Added ${newPerson.name} number ${newPerson.number} to phonebook`)
    mongoClient.connection.close()
  })
} else {
  mongoClient.connection.close()
}
