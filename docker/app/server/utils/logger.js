const log4js = require('log4js')

class Logger {
  constructor () {
    log4js.configure('config/log4js-config.json')
    this.systemLogger = log4js.getLogger('system')
    this.accessLogger = log4js.getLogger('access')
    this.errorLogger = log4js.getLogger('error')
  }
}

module.exports = new Logger()
