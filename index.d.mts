export interface ParentModule {
  filename: string
  require(request: string): any
}

export type Parent = ParentModule | string | { readonly href: string }
export type Stub = any

export interface StubFlags {
  '@noCallThru'?: boolean
  '@global'?: boolean
  '@runtimeGlobal'?: boolean
}

export interface Stubs {
  [request: string]: Stub
}

export interface ProxyquireInstance {
  <T = any>(request: string, stubs: Stubs): T
  load<T = any>(request: string, stubs: Stubs): T
  noCallThru(): ProxyquireInstance
  callThru(): ProxyquireInstance
  noPreserveCache(): ProxyquireInstance
  preserveCache(): ProxyquireInstance
}

export interface Proxyquire extends ProxyquireInstance {}

export interface ProxyquireStatic extends ProxyquireInstance {
  createProxyquire(parent: Parent): ProxyquireInstance
  from(parent: Parent): ProxyquireInstance
  compat(): never
}

export declare function createProxyquire(parent: Parent): ProxyquireInstance
export declare function from(parent: Parent): ProxyquireInstance

declare const proxyquire: ProxyquireStatic
export default proxyquire
