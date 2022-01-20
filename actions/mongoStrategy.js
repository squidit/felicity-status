const MongoClient = require('mongodb').MongoClient

const connect = () => {
  return new Promise(
    (resolve, reject) => {
      if (!process.env.MONGODB_URI) throw new Error('There\'s no MONGODB_URI variabele found')
      if (!process.env.MONGODB_NAME) throw new Error('There\'s no MONGODB_NAME variabele found')

      //  Conexão com o banco
      MongoClient.connect(`${process.env.MONGODB_URI}${process.env.MONGODB_NAME}`,
        {
          useNewUrlParser: true
        },
        (err, client) => {
          if (err) return reject(err)
          console.log('Connected successfully to server')
          resolve({ mongo: client, connection: client.db() })
        })
    }
  )
}

const closeConnection = ({ reply, mongo }) => {
  return new Promise(
    (resolve, reject) => {
      try {
        console.log('Fechando conexão')
        mongo.close()
        resolve({ reply, mongo })
      } catch (err) {
        console.log(err)
        reject(err)
      }
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
        const stats = await connection.stats()
        resolve({ reply, mongo, connection, dbOk: stats.ok })
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
  .catch(err => {
    throw err
  })
}

module.exports = {
  run
}
