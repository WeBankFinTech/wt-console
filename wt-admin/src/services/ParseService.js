const JSPrimaryTypes = {
  undefined: 'undefined',
  null: 'null',
  number: 'number',
  string: 'string',
  boolean: 'boolean',
  symbol: 'symbol'
}

const getPrimaryType = value => {
  let type = typeof value
  if (value === null) {
    type = JSPrimaryTypes.null
  }
  return type
}

const isPrimaryType = value => {
  const type = getPrimaryType(value)
  return Object.values(JSPrimaryTypes).some(primaryType => primaryType === type)
}

const toString = (value, space) => {
  try {
    let str = isPrimaryType(value) ? String(value) : JSON.stringify(value, null, space)
    return str || 'unknow value'
  } catch (err) {
    return err.toString()
  }
}

export const titleToString = (tags = []) => {
  let strList = []
  let color = ''
  // Console.rawConsole.log('tags', tags, tags.length)
  tags.forEach(tag => {
    if (typeof tag === 'string' && tag.includes('color:#')) {
      color = tag.replace('color:#', '')
    } else {
      tag = toString(tag, 2)
      let t = tag.split('%c')
      // Console.rawConsole.log('tag', t)
      if (t.length > 1) {
        let str = t[0]
        for (let j = 1; j < t.length; j += 1) {
          str += t[j]
        }
        strList.push(str)
        // i += t.length - 1
      } else {
        strList.push(t[0])
      }
    }
  })
  return { strList, color }
}

const parseIfJson = str => {
  if (typeof str == 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj == 'object' && obj) {
        return obj
      } else {
        return str
      }
    } catch (e) {
      return str
    }
  }
}

export const deepParseObj = obj => {
  if (typeof obj !== 'object') {
    return obj
  }
  let _obj
  if (Array.isArray(obj)) {
    _obj = []
    obj.forEach(value => {
      if (typeof value === 'object') {
        _obj.push(deepParseObj(value))
      } else if (typeof value === 'string') {
        _obj.push(deepParseObj(parseIfJson(value)))
      } else {
        _obj.push(value)
      }
    })
  } else {
    _obj = {}
    Object.keys(obj).forEach(key => {
      const value = obj[key]
      if (typeof value === 'object') {
        _obj[key] = deepParseObj(value)
      } else if (typeof value === 'string') {
        _obj[key] = deepParseObj(parseIfJson(value))
      } else {
        _obj[key] = value
      }
    })
  }
  return _obj
}
