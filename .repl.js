require('dotenv').config()

function reload(module){
  delete require.cache[require.resolve(module)]
  return require(module)
}

global.reload   = reload
global.rl       = reload
global.cl       = console.log

global.Promise     = require('bluebird')
global.Lazy        = require('lazy.js')
global.sprintf     = require('sprintf')
global.outdent     = require('outdent')
global.ccxt        = require('ccxt')

global.dd          = require('./dist').default // dexter-data
global.service     = require('./dist/service').default
