const mysql = require('mysql')
const {
  MYSQL_HOST,
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  MYSQL_DATABASE

} = process.env

const executeQuery = ({ connection, reply, results }) => new Promise((resolve, reject) => {
  try {
    connection.query('SELECT VERSION();', (err, results) => {
      if (err) {
        throw new Error(err.message)
      } else {
        resolve(results)
      }
    })
  } catch (err) {
    reject(err)
  }
})

/**
 * @desc Conecta no banco
 * @return {Promise} a conexão do banco
 */
const connect = (reply) => {
  return new Promise(
    (resolve, reject) => {
    //  Verifica se existem as env necessárias para a conexão
      if (!MYSQL_HOST) throw new Error('There\'s no MYSQL_HOST into .env')
      if (!MYSQL_USERNAME) throw new Error('There\'s no MYSQL_USERNAME into .env')
      if (!MYSQL_PASSWORD) throw new Error('There\'s no MYSQL_PASSWORD into .env')
      if (!MYSQL_DATABASE) throw new Error('There\'s no MYSQL_DATABASE into .env')
      try {
        const connection = mysql.createConnection({
          host: MYSQL_HOST,
          user: MYSQL_USERNAME,
          password: MYSQL_PASSWORD,
          database: MYSQL_DATABASE
        })
        connection.connect()
        resolve({ connection, reply })
      } catch (err) {
        reject(err)
      }
    }
  )
}

/**
 * @desc Fecha a conexão
 * @param {function} connection - Objeto de conexão do mysql
 * @param {function} reply - Objeto de response
 * @return {reply} reply response
 */
const closeConnection = ({ connection, reply }) => {
  return new Promise(
    (resolve, reject) => {
      try {
        connection.end()
        resolve({ reply })
      } catch (err) {
        reject(err)
      }
    }
  )
}
const run = (reply) => {
  return connect(reply)
    .then(executeQuery)
    .then(closeConnection)
}

module.exports = {
  run
}
