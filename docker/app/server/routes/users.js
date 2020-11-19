/* eslint-disable require-await */
const Router = require('koa-router')
const router = new Router()
const logger = require('../utils/logger')

// /v1/users#GET
router.get('/me', async (ctx) => {
  ctx.status = 200
  ctx.body = {
    uid: ctx.headers['x-auth-userid'],
    name: ctx.headers['x-auth-username'],
    mail: ctx.headers['x-auth-email'],
    role: ctx.headers['x-auth-roles']
  }
})

module.exports = router
