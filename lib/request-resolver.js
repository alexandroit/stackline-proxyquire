'use strict'

var fs = require('fs')
var Module = require('module')
var path = require('path')
var hasOwnProperty = Object.prototype.hasOwnProperty
var builtins = Object.create(null)

;(Module.builtinModules || []).forEach(function (name) {
  builtins[name] = true
  if (name.indexOf('node:') === 0) builtins[name.slice(5)] = true
})

function isFile (filename) {
  try {
    return fs.statSync(filename).isFile()
  } catch (_) {
    return false
  }
}

function isDirectory (filename) {
  try {
    return fs.statSync(filename).isDirectory()
  } catch (_) {
    return false
  }
}

function loadAsFile (candidate, extensions) {
  if (isFile(candidate)) return candidate
  for (var index = 0; index < extensions.length; index++) {
    var withExtension = candidate + extensions[index]
    if (isFile(withExtension)) return withExtension
  }
  return null
}

function packageMain (directory) {
  var manifestPath = path.join(directory, 'package.json')
  if (!isFile(manifestPath)) return null
  try {
    var manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    return typeof manifest.main === 'string' && manifest.main ? manifest.main : null
  } catch (_) {
    return null
  }
}

function loadAsDirectory (directory, extensions, visited) {
  if (!isDirectory(directory) || visited[directory]) return null
  visited[directory] = true

  var main = packageMain(directory)
  if (main && main !== '.' && main !== './') {
    var mainPath = path.resolve(directory, main)
    var mainFile = loadAsFile(mainPath, extensions)
    if (mainFile) return mainFile
    var mainDirectory = loadAsDirectory(mainPath, extensions, visited)
    if (mainDirectory) return mainDirectory
  }

  return loadAsFile(path.join(directory, 'index'), extensions)
}

function loadPath (candidate, extensions) {
  return loadAsFile(candidate, extensions) ||
    loadAsDirectory(candidate, extensions, Object.create(null))
}

function packageRequest (request) {
  var parts = request.split('/')
  if (request.charAt(0) === '@') {
    if (parts.length < 2) return null
    return { name: parts.slice(0, 2).join('/'), subpath: parts.slice(2).join('/') }
  }
  return { name: parts[0], subpath: parts.slice(1).join('/') }
}

function nodeModulesPaths (basedir, globalPaths) {
  var result = []
  var seen = Object.create(null)
  var current = path.resolve(basedir)

  while (true) {
    var candidate = path.join(current, 'node_modules')
    if (!hasOwnProperty.call(seen, candidate)) {
      seen[candidate] = true
      result.push(candidate)
    }
    var parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }

  ;(globalPaths || []).forEach(function (candidate) {
    var normalized = path.resolve(candidate)
    if (!hasOwnProperty.call(seen, normalized)) {
      seen[normalized] = true
      result.push(normalized)
    }
  })
  return result
}

function notFound (request, baseModule) {
  var error = new Error("Cannot find module '" + request + "' from '" + path.dirname(baseModule) + "'")
  error.code = 'MODULE_NOT_FOUND'
  return error
}

module.exports = function resolveRequest (baseModule, request, extensions, globalPaths) {
  if (typeof request !== 'string' || request.length === 0) throw notFound(String(request), baseModule)
  if (
    hasOwnProperty.call(builtins, request) ||
    (request.indexOf('node:') === 0 && hasOwnProperty.call(builtins, request.slice(5)))
  ) return request

  var resolved
  if (path.isAbsolute(request)) {
    resolved = loadPath(request, extensions)
  } else if (request.charAt(0) === '.') {
    resolved = loadPath(path.resolve(path.dirname(baseModule), request), extensions)
  } else {
    var parsed = packageRequest(request)
    if (parsed) {
      var searchPaths = nodeModulesPaths(path.dirname(baseModule), globalPaths)
      for (var index = 0; index < searchPaths.length && !resolved; index++) {
        var packageRoot = path.join(searchPaths[index], parsed.name)
        var candidate = parsed.subpath ? path.join(packageRoot, parsed.subpath) : packageRoot
        resolved = loadPath(candidate, extensions)
      }
    }
  }

  if (!resolved) throw notFound(request, baseModule)
  return resolved
}
