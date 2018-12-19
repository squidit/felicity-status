const mongoose = require('mongoose')
const {find} = require('../command/queryCommand')

/**
 * @desc Pega de forma dinamica todos os modelos e faz uma query geral para eles, verificando se volta resultados
 * @param {*} mongoose - Objeto do mongoose
 * @param {*} reply - Objeto para emitir response
 */
const checkMongoStatus = async ({ mongoose, reply }) => {
  return new Promise(
    async (resolve, reject) => {
      try {
        //  Pega a primeira coleção disponivel
        const firstCollection = Object.keys(mongoose.connections[0].collections)[0] || false
        //  Pega todos os modelos existente no mongoose
        const models = Object.keys(mongoose.connections[0].collections[firstCollection].conn.models)
        const queue = []
        for (let model of models) {
          queue.push(find(model))
        }

        await Promise.all(queue)
        return resolve({ reply })
      } catch (err) {
        reject(err)
      }
    }
  )
}

/**
 * @desc Verifica se a conexão do mongo esta em pé
 * @param {*} mongoose - Objeto do mongo
 * @param {*} reply - Objeto para mandar response.
 */
const checkMongoDatabase = (mongoose, reply) => {
  return new Promise((resolve, reject) => {
    const {readyState} = mongoose.connection
    switch (readyState) {
      case 0:
      case 2:
      case 3:
        return reject(new Error(`Banco desconectado`))
      case 1:
      default:
        //  Banco esta conectado agora deve verificar o próximo pipeline
        return resolve({ mongoose, reply })
    }
  })
}

const run = (reply) => {
  return checkMongoDatabase(mongoose, reply)
          .then(checkMongoStatus)
}

module.exports = {
  run
}
