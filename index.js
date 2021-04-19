/**
 * @author Guilherme Pereira<guiihpr@gmail.com>
 * @desc Plugin para rota de status
 */
const ActionWrapper = require('./actions/defineAction')
const { version } = require('./package.json')

const statusPluginV18 = {
  name: 'sq-status',
  version: version,
  register: async function (server, options) {
    server.route({
      method: 'GET',
      path: '/v1/status',
      handler: async (_, reply) => {
        try {
          if (!process.env.DRIVER_FELICITY) throw Error('Missing DRIVER Felicity')
          await ActionWrapper.action(process.env.DRIVER_FELICITY, reply.response)
          return {
            statusCode: 200,
            message: 'Up and running'
          }
        } catch (err) {
          return {
            statusCode: 500,
            message: err.message
          }
        }
      }
    })
    console.log('statusPlugin is ready!')
  }
}

const statusPlugin = {
  hapi18: statusPluginV18,

  register: async (server, options, next) => {
    server.route({
      method: 'GET',
      path: '/v1/status',
      handler: async (request, reply) => {
        try {
          if (!process.env.DRIVER_FELICITY) throw Error('Missing DRIVER Felicity')
          return ActionWrapper.action(process.env.DRIVER_FELICITY)
            .then(result => emitSuccessMessage(({ reply })))
        } catch (err) {
          reply({
            statusCode: 500,
            message: err.message
          })
        }
      }
    })
    console.log('statusPlugin is ready!')

    next()
  }
}

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

statusPlugin.register.attributes = {
  name: 'sq-status',
  version: version
}

module.exports = statusPlugin
