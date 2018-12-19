var mongoose = require('mongoose')

const find = (schema) => {
  return mongoose.model(schema).find({}).limit(1).lean().exec()
}

module.exports = {
  find
}
