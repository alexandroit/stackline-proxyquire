'use strict'

var packageRequest = process.argv[2]
var results = []

for (var index = 0; index < 128; index++) {
  var proxyquire = require(packageRequest)
  var stub = { label: 'stub-' + index }
  var subject = proxyquire('./fixtures/subject', { './dependency': stub })
  results.push({
    description: subject.describe(),
    hiddenEnumerable: Object.prototype.propertyIsEnumerable.call(stub, 'hidden'),
    sameStub: subject.dependency === stub
  })
}

var noCallThruStub = { label: 'terminal', '@noCallThru': true }
var noCallThruSubject = require(packageRequest).noCallThru()('./fixtures/subject', {
  './dependency': noCallThruStub
})
results.push({
  description: noCallThruSubject.describe(),
  keys: Object.keys(noCallThruSubject.dependency).sort()
})

var primitiveSubject = require(packageRequest)('./fixtures/primitive-subject', {
  './primitive-number': false,
  './primitive-object': ''
})
results.push({ number: primitiveSubject.number, object: primitiveSubject.object })

try {
  require(packageRequest)(null, {})
} catch (error) {
  results.push({ errorName: error.name, errorMessage: error.message })
}

try {
  require(packageRequest)('./fixtures/subject', { './dependency': null })
} catch (error) {
  results.push({ missingCode: error.code, missingMessage: error.message })
}

process.stdout.write(JSON.stringify(results))
