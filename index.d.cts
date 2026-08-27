export as namespace proxyquire

declare namespace proxyquire {
  interface ParentModule {
    filename: string
    require(request: string): any
  }

  type Parent = ParentModule | string | { readonly href: string }
  type Stub = any

  interface StubFlags {
    '@noCallThru'?: boolean
    '@global'?: boolean
    '@runtimeGlobal'?: boolean
  }

  interface Stubs {
    [request: string]: Stub
  }

  interface ProxyquireInstance {
    <T = any>(request: string, stubs: Stubs): T
    load<T = any>(request: string, stubs: Stubs): T
    noCallThru(): ProxyquireInstance
    callThru(): ProxyquireInstance
    noPreserveCache(): ProxyquireInstance
    preserveCache(): ProxyquireInstance
  }

  interface Proxyquire extends ProxyquireInstance {}

  interface ProxyquireStatic extends ProxyquireInstance {
    createProxyquire(parent: Parent): ProxyquireInstance
    from(parent: Parent): ProxyquireInstance
    compat(): never
  }
}

declare const proxyquire: proxyquire.ProxyquireStatic
export = proxyquire
