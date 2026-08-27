import proxyquire = require('../index')

interface ProxyquireConstructor {
  new (parent: proxyquire.ParentModule): proxyquire.ProxyquireInstance
}

declare const Proxyquire: ProxyquireConstructor
export = Proxyquire
