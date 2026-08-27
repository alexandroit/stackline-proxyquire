import proxyquire = require('../..')

interface Subject {
  dependency: { label: string }
  describe(): { label: string; hidden?: string; sum: number | null }
}

const loaded = proxyquire<Subject>('../fixtures/subject', {
  './dependency': { label: 'legacy', '@noCallThru': true }
})
loaded.dependency.label.toUpperCase()
loaded.describe().sum

const configured: proxyquire.ProxyquireInstance = proxyquire.noCallThru().preserveCache()
configured.load<Subject>('../fixtures/subject', {})

const anchored = proxyquire.createProxyquire('/absolute/consumer.js')
anchored<Subject>('./subject', {})
