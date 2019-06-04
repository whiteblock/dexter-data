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
global.dd          = require('./dist') // dexter-data
