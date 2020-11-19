/* eslint-disable no-console */
const Koa = require('koa')
const Router = require('koa-router')
const Bodyparser = require('koa-bodyparser')
const app = new Koa()
const { v4: uuidv4 } = require('uuid')
const router = new Router()
const config = require('config')
require('koa2-ctx-validator')(app)
const logger = require('./utils/logger')

// APIs
const users = require('./routes/users')

app.use(Bodyparser({ multipart: true, jsonLimit: config.system.jsonLimit }))

app.use(async (ctx, next) => {
  logger.accessLogger.info(ctx.method + ' ' + ctx.url)
  ctx.xLog = ''
  ctx.uuid = uuidv4()
  ctx.appendLog = function (msg) {
    this.xLog += msg + '\r\n'
  }

  // interface log
  ctx.appendLog(
    'InterfaceLog\r\nrequest[query] : ' + JSON.stringify(ctx.request.query)
  )

  if (ctx.method === 'POST' || ctx.method === 'PUT') {
    let request = 'hide'
    if (
      !config.system.hideLogApis.some(el =>
        (ctx.method + '#' + ctx.url).includes(el)
      )
    ) {
      request = JSON.stringify(ctx.request.body)
      if (request != null && request.length > 1000) {
        request = request.substring(0, 1000)
      }
    }
    ctx.appendLog('request[body]  : ' + request)
  }

  await next()

  const rt = ctx.response.get('X-Response-Time')
  logger.systemLogger.debug(`[${ctx.uuid}] ${ctx.method} ${ctx.path} - ${rt}`)
  let response = 'hide'
  if (
    !config.system.hideLogApis.some(el =>
      (ctx.method + '#' + ctx.url).includes(el)
    )
  ) {
    response = JSON.stringify(ctx.response.body)
    if (response != null && response.length > 1000) {
      response = response.substring(0, 1000)
    }
  }
  ctx.appendLog('response : ' + response)
  ctx.appendLog('status   : ' + ctx.status)
  logger.systemLogger.info(ctx.xLog)
})

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now()
  try {
    logger.systemLogger.debug(`[${ctx.uuid}] ${ctx.method} ${ctx.path} start`)

    // token check ?

    await next()
    logger.systemLogger.debug(`[${ctx.uuid}] ${ctx.method} ${ctx.path} end`)
  } catch (err) {
    if (
      err.status == null ||
      (err.status != null &&
        config.system.errorLogStatus.some(el =>
          ('' + err.status).includes(el)
        ))
    ) { logger.errorLogger.error(err) }

    ctx.status = err.status || 500
    ctx.body = { message: err.message }
    ctx.app.emit('error', err, ctx)
  }
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})

app.on('error', (err) => {
  if (
    err.status != null &&
    config.system.errorLogStatus.some(el => ('' + err.status).includes(el))
  ) { logger.errorLogger.error(err) }
})

process.on('SIGINT', () => {
  process.exit()
})

app.use(router.routes()).use(router.allowedMethods())

router.use('/v1/users', users.routes())

export default {
  path: '/api',
  handler: app.callback()
}
