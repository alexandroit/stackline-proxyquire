'use strict'

var previous = require.extensions['.js']
function installedHandler (loadedModule, filename) {
  return previous(loadedModule, filename)
}

require.extensions['.js'] = installedHandler
module.exports = installedHandler
