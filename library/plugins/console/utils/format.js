const strongJSONStringify = (obj) => {
  const seen = []
  return JSON.stringify(obj, (key, val) => {
    if (val !== null && typeof val === 'object') {
      if (seen.indexOf(val) >= 0) {
        return
      }
      seen.push(val)
    }
    return val
  })
}

export default function format () {
  const argumentArray = Array.from(arguments)
  const firstArg = argumentArray.shift(1)

  if (typeof firstArg !== 'string') {
    const tmp = Array.from(arguments)

    return tmp.reduce((result, item) => {
      return result + ', ' + strongJSONStringify(item)
    }, '')
  }

  let resultString = ''
  let i = 0
  let hasPercentSign = false

  while (firstArg && firstArg.length && i < firstArg.length) {
    const token = firstArg[i]
    if (hasPercentSign) {
      if (['c', 's', 'i', 'd', 'f', 'O', 'o', '%'].indexOf(token) > -1) {
        hasPercentSign = false
        if ('c' === token) {
          // ignore %c
          argumentArray.shift()
        } else if ('s' === token) {
          resultString += argumentArray.shift()
        } else if ('o' === token.toLowerCase()) {
          resultString += strongJSONStringify(argumentArray.shift())
        } else if ('i' === token || 'd' === token) {
          let val = ''
          try {
            val = parseInt(argumentArray.shift())
          } catch (e) {
            console.warn(e)
          }
          resultString += '' + val
        } else if ('f' === token) {
          let val = ''
          try {
            val = parseFloat(argumentArray.shift())
          } catch (e) {
            console.warn(e)
          }
          resultString += '' + val
        } else if ('%' === token) {
          resultString += '' + '%'
          hasPercentSign = false
        }
      } else {
        resultString += '' + '%' + token
        hasPercentSign = true
      }
    } else if ('%' === token) {
      hasPercentSign = true
    } else {
      resultString += '' + token
    }
    i++
  }

  if (argumentArray.length > 0) {
    const stringifiedArray = argumentArray.map(item => {
      return typeof item === 'object' ? strongJSONStringify(item) : item
    })
    resultString += ' ' + stringifiedArray.join(' ')
  }

  return resultString
}
