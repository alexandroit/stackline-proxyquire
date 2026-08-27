import proxyquire, {
  createProxyquire,
  from,
  type ProxyquireInstance,
  type ProxyquireStatic,
  type Stubs
} from '@stackline/proxyquire'
import is from '@stackline/proxyquire/lib/is'

interface Subject {
  dependency: { label: string }
}

const root: ProxyquireStatic = proxyquire
const stubs: Stubs = { './dependency': { label: 'modern' } }
const anchored: ProxyquireInstance = createProxyquire(import.meta.url)
const alias: ProxyquireInstance = from(new URL(import.meta.url))

anchored<Subject>('../fixtures/subject', stubs).dependency.label.toUpperCase()
alias.load<Subject>('../fixtures/subject', stubs)
root.callThru().preserveCache()
is.String('typed')
