export default function () {
  const argumentArray = Array.from(arguments)
  const firstArg = argumentArray.shift(1)

  let resultString = ''
  let i = 0
  let hasPercentSign = false
  while (i < firstArg.length) {
    const token = firstArg[i]
    if (hasPercentSign && ['c', 's', 'i', 'd', 'f', 'O', 'o'].indexOf(token) > -1) {
      hasPercentSign = false
      if ('c' === token) {
        // ignore %c
        argumentArray.shift()
      } else if ('s' === token) {
        resultString += argumentArray.shift()
      } else if ('o' === token.toLowerCase()) {
        resultString += JSON.stringify(argumentArray.shift())
      } else if ('i' === token || 'd' === token) {
        let val = ''
        try {
          val = parseInt(argumentArray.shift())
        } catch (e){
          console.warn(e)
        }
        resultString += '' + val
      } else if ('f' === token) {
        let val = ''
        try {
          val = parseFloat(argumentArray.shift())
        } catch (e){
          console.warn(e)
        }
        resultString += '' + val
      } else if ('%' === token) {
        resultString += '' + '%'
        hasPercentSign = true
      }
      i++
    } else if ('%' === token) {
      if (hasPercentSign) {
        resultString += '%'
      }
      hasPercentSign = true
      i++
    } else {
      resultString += '' + token
      i++
    }
  }

  if (argumentArray.length > 0) {
    const stringifiedArray = argumentArray.map(item => {
      return typeof item === 'object' ? JSON.stringify(item) : item
    })
    resultString += ' ' + stringifiedArray.join(' ')
  }

  return resultString
}
