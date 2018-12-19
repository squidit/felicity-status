/**
 * @author Guilherme Pereira<guiihpr@gmail.com>
 * @desc Plugin para rota de status
 */
const ActionWrapper = require('./actions/defineAction')


/**
 *
 * @param {function} reply - função para emitir response
 */
const emitSuccessMessage = ({ reply }) => {
  return reply({
    statusCode: 200,
    message: 'Up and running'
  })
}


const statusPlugin = {
  register: async (server, options, next) => {
    server.route({
      method: 'GET',
      path: '/status',
      handler: (request, reply) => {
        try {
          if (!process.env.DRIVER_FELICITY) throw Error('Missing DRIVER Felicity')
          return ActionWrapper.action(process.env.DRIVER_FELICITY, reply)
                .then(emitSuccessMessage)
        } catch (err) {
          reply({
            statusCode: 500,
            message: err.message
          })
        }
      }
    })
    console.log(`statusPlugin is ready!`)

    next()
  }
}
statusPlugin.register.attributes = {
  name: 'sq-status',
  version: '0.0.1',
  multiple: false
}

module.exports = statusPlugin
