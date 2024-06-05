const mongoClient = require('mongoose')

mongoClient.set('strictQuery', false)
mongoClient.connect(`mongodb+srv://slowfinger00:${process.env.MONGO_PASSWORD}@fullstack.phdfxec.mongodb.net/?retryWrites=true&w=majority&appName=fullstack`).then(() => {
  console.log('connected to MongoDB')
}).catch((err) => {
  console.log('error connecting to MongoDB:', err.message)
})
mongoClient.connection.useDb('phonebookPart3')

const personSchema = new mongoClient.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function(val) {
        return /^(\d{2}|\d{3})-\d{1,}$/.test(val)
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: true
  },
})

personSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
  }
})

module.exports = mongoClient.model('Person', personSchema)