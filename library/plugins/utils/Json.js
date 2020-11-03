export const decycle = (object, replacer) => {
  let objects = new WeakMap()     // object to path mappings

  return (function derez (value, path) {
    let oldPath   // The path of an earlier occurance of value
    let nu         // The new object or array

    if (replacer !== undefined) {
      value = replacer(value)
    }

    if (
        typeof value === 'object' &&
        value !== null &&
        !(value instanceof Boolean) &&
        !(value instanceof Date) &&
        !(value instanceof Number) &&
        !(value instanceof RegExp) &&
        !(value instanceof String)
      ) {
      oldPath = objects.get(value)
      if (oldPath !== undefined) {
        return {$ref: oldPath}
      }

      objects.set(value, path)

      if (Array.isArray(value)) {
        nu = []
        value.forEach(function (element, i) {
          nu[i] = derez(element, path + '[' + i + ']')
        })
      } else {
        nu = {}
        Object.keys(value).forEach(function (name) {
          nu[name] = derez(
            value[name],
            path + '[' + JSON.stringify(name) + ']'
          )
        })
      }
      return nu
    }
    return value
  }(object, '$'))
}

export const stringify = (obj) => {
  let cache = []
  setTimeout(() => {
    cache = null
  }, 200)
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return
      }
      cache.push(value)
    }
    return value
  })
}

export default decycle

