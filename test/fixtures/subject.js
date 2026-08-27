'use strict'

var dependency = require('./dependency')

module.exports = {
  dependency: dependency,
  describe: function () {
    return {
      label: dependency.label,
      hidden: dependency.hidden,
      sum: typeof dependency.add === 'function' ? dependency.add(2, 3) : null
    }
  }
}
