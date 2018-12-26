const mongoStrategy = require('./mongoStrategy')

/**
 * @desc Essa implemntação é um Strategy Pattern, ou seja
 * existem varios tipos de strategies como o mongooseStrategy,
 * e como todas as strategies possuem um contrato padrão, como no caso em questão
 * que é a implementação do método run, então o defineAction é só um wrapper pra encapsular
 * as ações de strategies que existem.
 * @param {string {{mongoose}}} driver - Tipo de conexão que vai ser feita
 * @param {function} reply - função de resposta
 */

const defineAction = (driver, reply) => {
  const allowedActions = {
    'mongo': mongoStrategy
  }
  const action = allowedActions[driver] || null
  if (!action) throw new Error(`Não foi possível reconhecer o driver ${driver}`)
  return action.run(reply)
}

module.exports = {
  action: defineAction
}
