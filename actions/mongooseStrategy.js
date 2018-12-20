const mongoose = require('mongoose')
const {find} = require('../command/queryCommand')
const MongoClient = require('mongodb').MongoClient;

const connect = (reply) => {
  return new Promise(
    (resolve, reject) => {
      if (!process.env.MONGODB_URI) throw new Error(`There's no MONGODB_URI variabele found`)
      if (!process.env.MONGODB_NAME) throw new Error(`There's no MONGODB_NAME variabele found`)

      //  Conexão com o banco
      MongoClient.connect(process.env.MONGODB_URI, (err, client) => {
        console.log('Connected successfully to server')
        const db = client.db(process.env.MONGODB_NAME)
        resolve({ mongo: db, reply, connection: client })
      })
    }
  )
}

const closeConnection = ({reply, mongo, connection}) => {
  return new Promise(
    (resolve, reject) => {
      try {
        console.log('Fechando conexão')
        connection.close()
        resolve({reply, mongo})
      } catch (err) {
        console.log(err)
        reject(err)
      }
    }
  )
}

const transformFindIntoPromise = (collection) => {
  return new Promise(
    (resolve, reject) => {
      collection.find({}).limit(1).toArray((err, docs) => {
        if (err) reject(err)
        resolve(docs)
      })
    }
  )
}

/**
 * @desc Pega de forma dinamica todos os modelos e faz uma query geral para eles, verificando se volta resultados
 * @param {*} mongoose - Objeto do mongoose
 * @param {*} reply - Objeto para emitir response
 */
const checkMongoStatus = async ({ mongo, reply, connection }) => {
  return new Promise(
    async (resolve, reject) => {
      try {
        mongo.listCollections().toArray(async (err, itens) => {
          if (err) reject(err)
          const collections = itens.map(it => it.name)
          const queue = []
          for (let collection of collections) {
            queue.push(transformFindIntoPromise(mongo.collection(collection)))
          }
          await Promise.all(queue)

          resolve({reply, mongo, connection})
        })
        // console.log('Chegou', collections)

        // //  Pega a primeira coleção disponivel
        // const firstCollection = Object.keys(mongoose.connections[0].collections)[0] || false
        // //  Pega todos os modelos existente no mongoose
        // const models = Object.keys(mongoose.connections[0].collections[firstCollection].conn.models)
        // const queue = []
        // for (let model of models) {
        //   queue.push(find(model))
        // }

        // await Promise.all(queue)
        // return resolve({ reply })
      } catch (err) {
        console.log(err)
        reject(err)
      }
    }
  )
}


const run = (reply) => {
  return connect(reply)
          .then(checkMongoStatus)
          .then(closeConnection)
}

module.exports = {
  run
}
