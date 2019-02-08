const MongoClient = require('mongodb').MongoClient

const connect = (reply) => {
  return new Promise(
    (resolve, reject) => {
      if (!process.env.MONGODB_NAME) throw new Error(`There's no MONGODB_NAME variabele found`)
      if (!process.env.MONGODB_USERNAME) throw new Error(`There's no MONGODB_USERNAME variabele found`)
      if (!process.env.MONGODB_PASSWORD) throw new Error(`There's no MONGODB_PASSWORD variabele found`)
      if (!process.env.MONGODB_HOST) throw new Error(`There's no MONGODB_HOST variabele found`)
      if (!process.env.MONGODB_PORT) throw new Error(`There's no MONGODB_PORT variabele found`)
      if (!process.env.MONGODB_COLLECTIONS) throw new Error(`There's no MONGODB_COLLECTIONS variabele found`)

      //  Pega a senha do banco
      const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_HOST, MONGODB_PORT, MONGODB_NAME } = process.env
      const mongoURI = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_NAME}`
      const options = {
        user: MONGODB_USERNAME,
        password: MONGODB_PASSWORD
      }
      MongoClient.connect(mongoURI, options, (err, client) => {
        if (err) {
          return reject(err)
        }
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
        const {MONGODB_COLLECTIONS} = process.env
        const collections = MONGODB_COLLECTIONS.split(',')
        const queue = []
        for (let collection of collections) {
          queue.push(transformFindIntoPromise(mongo.collection(collection)))
        }
        await Promise.all(queue)
        resolve({reply, mongo, connection})
      } catch (err) {
        console.log(err)
        reject(err)
      }
    }
  )
}

const run = (reply) => {
  return connect(reply).then(checkMongoStatus).then(closeConnection)
}

module.exports = {
  run
}
