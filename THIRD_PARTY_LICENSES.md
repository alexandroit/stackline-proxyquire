# Third-Party Licenses

## proxyquire

- Upstream: <https://github.com/thlorenz/proxyquire>
- Compatibility baseline: `proxyquire@2.1.3`
- Original author: Thorsten Lorenz
- License: MIT

The complete upstream copyright and permission notice is retained in
[LICENSE](./LICENSE). The Stackline implementation preserves the public API and
licensed test intent while replacing substantial dependency, loader, type, and
release internals.

The published package retains exact-pinned `resolve@1.22.12` because its
request-identity behavior is part of upstream compatibility. Its seven-node
MIT-licensed production graph is `resolve`, `es-errors`, `is-core-module`,
`hasown`, `function-bind`, `path-parse`, and
`supports-preserve-symlinks-flag`. Each installed dependency carries its own
license file, and the release SBOM records the exact versions and relationships.

Small compatibility helpers derived from former dependencies are internalized;
their notices are preserved below.

## Runtime dependency graph

| Package | Version | License | Source |
| --- | --- | --- | --- |
| `resolve` | 1.22.12 | MIT | <https://github.com/browserify/resolve> |
| `es-errors` | 1.3.0 | MIT | <https://github.com/ljharb/es-errors> |
| `is-core-module` | 2.16.2 | MIT | <https://github.com/inspect-js/is-core-module> |
| `hasown` | 2.0.4 | MIT | <https://github.com/inspect-js/hasOwn> |
| `function-bind` | 1.1.2 | MIT | <https://github.com/Raynos/function-bind> |
| `path-parse` | 1.0.7 | MIT | <https://github.com/jbgutierrez/path-parse> |
| `supports-preserve-symlinks-flag` | 1.0.0 | MIT | <https://github.com/inspect-js/node-supports-preserve-symlinks-flag> |

## fill-keys 1.0.2

The MIT License (MIT)

Copyright (c) Ben Drucker <bvdrucker@gmail.com> (bendrucker.me)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## merge-descriptors 1.0.3

(The MIT License)

Copyright (c) 2013 Jonathan Ong <me@jongleberry.com>
Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## module-not-found-error 1.0.1

The MIT License (MIT)

Copyright (c) Ben Drucker <bvdrucker@gmail.com> (bendrucker.me)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
