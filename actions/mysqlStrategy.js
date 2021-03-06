const mysql = require('mysql')
const {
  MYSQL_HOST,
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  MYSQL_DATABASE

} = process.env

/**
 * @desc Pega todos bancos de dados que tem
 * @param {mysql} connection - conexão do mysql
 * @param {function} reply - Reply do hapi
 * @returns {Promise<{connection, reply}>} - promise
 */
const getAllDatabases = ({connection, reply}) => {
  return new Promise(
    (resolve, reject) => {
      connection.query('show full tables where Table_Type = "BASE TABLE";', (err, results) => {
        if (err) reject(err)
        resolve({connection, reply, results})
      })
    }
  )
}

/**
 * @desc Executa de forma paralela as queries para todas as tabelas
 * @param {mysql} connection - conexão do mysql
 * @param {function} reply - Reply do hapi
 * @param {Array<object>} results - Result das tabelas
 * @returns {Promise<{connection, reply}>} - promise
 */
const executeQueryOfAllTables = ({connection, reply, results}) => {
  return new Promise(
    async (resolve, reject) => {
      try {
        const queueOfResultsQuery = []
        for (let table of results) {
          const prop = Object.keys(table)[0]
          queueOfResultsQuery.push(executeQuery(connection, table[prop]))
        }
        await Promise.all(queueOfResultsQuery)
        resolve({connection, reply})
      } catch (err) {
        console.log('Erro ===========================')
        reject(err)
      }
    }
  )
}

const executeQuery = async (connection, table) => new Promise((resolve, reject) => {
  try {
    connection.query(`SELECT * FROM ${table} LIMIT 1;`, (err, results) => {
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
      if (!MYSQL_HOST) throw new Error(`There's no MYSQL_HOST into .env`)
      if (!MYSQL_USERNAME) throw new Error(`There's no MYSQL_USERNAME into .env`)
      if (!MYSQL_PASSWORD) throw new Error(`There's no MYSQL_PASSWORD into .env`)
      if (!MYSQL_DATABASE) throw new Error(`There's no MYSQL_DATABASE into .env`)
      try {
        const connection = mysql.createConnection({
          host: MYSQL_HOST,
          user: MYSQL_USERNAME,
          password: MYSQL_PASSWORD,
          database: MYSQL_DATABASE
        })
        connection.connect()
        resolve({connection, reply})
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
const closeConnection = ({connection, reply}) => {
  return new Promise(
    (resolve, reject) => {
      try {
        connection.end()
        resolve({reply})
      } catch (err) {
        reject(err)
      }
    }
  )
}
const run = (reply) => {
  return connect(reply)
    .then(getAllDatabases)
    .then(executeQueryOfAllTables)
    .then(closeConnection)
}

module.exports = {
  run
}
