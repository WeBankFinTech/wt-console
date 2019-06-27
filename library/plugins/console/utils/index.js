/**
 * Created by yatesmiao on 2018/10/26.
 */
/**
 * get formatted date by timestamp
 * @param  int    time
 * @return  object
 */
function getDate (time) {
  let d = time > 0 ? new Date(time) : new Date()
  let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate(),
    month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1),
    year = d.getFullYear(),
    hour = d.getHours() < 10 ? '0' + d.getHours() : d.getHours(),
    minute = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes(),
    second = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds(),
    millisecond = d.getMilliseconds() < 10 ? '0' + d.getMilliseconds() : d.getMilliseconds()
  if (millisecond < 100) { millisecond = '0' + millisecond }
  return {
    time: (+d),
    year: year,
    month: month,
    day: day,
    hour: hour,
    minute: minute,
    second: second,
    millisecond: millisecond
  }
}

/**
 * determines whether the passed value is a specific type
 * @param mixed value
 * @return boolean
 */
function isNumber (value) {
  return Object.prototype.toString.call(value) == '[object Number]'
}
function isString (value) {
  return Object.prototype.toString.call(value) == '[object String]'
}
function isArray (value) {
  return Object.prototype.toString.call(value) == '[object Array]'
}
function isBoolean (value) {
  return Object.prototype.toString.call(value) == '[object Boolean]'
}
function isUndefined (value) {
  return Object.prototype.toString.call(value) == '[object Undefined]'
}
function isNull (value) {
  return Object.prototype.toString.call(value) == '[object Null]'
}
function isSymbol (value) {
  return Object.prototype.toString.call(value) == '[object Symbol]'
}
function isObject (value) {
  return (
    Object.prototype.toString.call(value) == '[object Object]' ||
    // if it isn't a primitive value, then it is a common object
    (
      !isNumber(value) &&
      !isString(value) &&
      !isBoolean(value) &&
      !isArray(value) &&
      !isNull(value) &&
      !isFunction(value) &&
      !isUndefined(value) &&
      !isSymbol(value)
    )
  )
}
function isFunction (value) {
  return Object.prototype.toString.call(value) == '[object Function]'
}
function JSONStringify (stringObject, formatOption = '\t', replaceString = 'CIRCULAR_DEPENDECY_OBJECT') {
  let cache = []
  const returnStringObject = JSON.stringify(stringObject, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (~cache.indexOf(value)) {
        return replaceString
      }
      cache.push(value)
    }
    return value
  }, formatOption)
  cache = null
  return returnStringObject
}
function getObjName(obj) {
  return Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '');
}
export {getDate, isArray, isBoolean, isString, isFunction, isUndefined, isNull, isObject, isSymbol, isNumber, JSONStringify, getObjName}
