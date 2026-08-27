import proxyquire = require('@stackline/proxyquire')

interface Subject {
  dependency: { label: string }
}

const subject = proxyquire.load<Subject>('../fixtures/subject', {
  './dependency': { label: 'commonjs' }
})
subject.dependency.label.toUpperCase()

const instance: proxyquire.ProxyquireInstance = proxyquire.from('/absolute/consumer.cjs')
instance.noPreserveCache().callThru()
