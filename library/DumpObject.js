import React, {Component} from 'react'
import {
  Text,
  View,
  TouchableOpacity, PixelRatio
} from 'react-native'
import PropTypes from 'prop-types'
import Console from './plugins/console/Console'
const realOnePixel = 1 / PixelRatio.get()

const FONT_SIZE = 12
const JSPrimaryTypes = {
  undefined: 'undefined',
  null: 'null',
  number: 'number',
  string: 'string',
  boolean: 'boolean',
  symbol: 'symbol'
}

const JSCompositeTypes = {
  array: 'array',
  object: 'object',
}

const getPrimaryType = (value) => {
  let type = typeof value
  if (value === null) {
    type = JSPrimaryTypes.null
  }
  return type
}
/**
 * isPrimaryType(12)
 * isPrimaryType(true)
 * isPrimaryType('123')
 * isPrimaryType(Symbol())
 * isPrimaryType(undefined)
 * isPrimaryType(null)
 * @param value
 * @returns {boolean}
 */
const isPrimaryType = (value) => {
  const type = getPrimaryType(value)
  return Object.values(JSPrimaryTypes).some((primaryType) => primaryType === type)
}
const isObjectType = (value) => {
  return typeof value === 'object' && value !== null
}
const isArrayType = (value) => {
  return Array.isArray(value)
}
const toString = (value) => {
  try {
    return isPrimaryType(value) ? String(value) : JSON.stringify(value)
  } catch (err) {
    return err.toString()
  }
}

const arrayToString = (value) => {
  return value.map((item) => toString(item)).join(' ')
}

class Card extends Component {
  render () {
    return (
      <View style={[{
        marginLeft: 10,
        paddingLeft: 5,
        borderLeftWidth: realOnePixel,
        borderLeftColor: '#AAAAAA'
      }, this.props.style]}>{this.props.children}</View>
    )
  }
}

class Arrow extends Component {
  render () {
    const {
      show,
      str
    } = this.props
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        activeOpacity={0.5}
      >
        <View style={{flexDirection: 'row', marginVertical: 5}}>
          <Text style={{fontSize: FONT_SIZE}}>{show ? '👇' : '👉️'}</Text>
          <Text
            style={[{flex: 1, color: this.props.color, fontSize: FONT_SIZE}, this.props.isGroup ? {fontWeight: 'bold'} : null]}
            numberOfLines={show && this.props.isGroup ? undefined : 1}>{str}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}
class PrimaryValue {
  constructor (value) {
    this.type = getPrimaryType(value)
    this.value = value
  }
  toString () {
    switch (this.type) {
      case JSPrimaryTypes.null:
        return JSPrimaryTypes.null
      case JSPrimaryTypes.undefined:
        return JSPrimaryTypes.undefined
      case JSPrimaryTypes.boolean:
        return String(this.value)
      case JSPrimaryTypes.string:
        return this.value
      case JSPrimaryTypes.number:
        return String(this.value)
      case JSPrimaryTypes.symbol:
        return JSPrimaryTypes.symbol
      default:
        return 'unknow'
    }
  }
}

class JSPrimary extends Component {
  static propTypes = {
    value: PropTypes.any
  }
  render () {
    const {
      value,
      style
    } = this.props
    const pv = new PrimaryValue(value)
    return (
      <Text style={[{fontSize: FONT_SIZE}, style]}>{pv.toString()}</Text>
    )
  }
}
class Item extends Component {
  render () {
    return (
      <View style={[{
        flexDirection: 'row'
      }, this.props.style]}>
        {this.props.valueKey !== undefined ? <Text>{this.props.valueKey}: </Text> : null}
        <JSValue style={{flex: 1, marginLeft: 5}} value={this.props.value} />
      </View>
    )
  }
}
class JSArray extends Component {
  static propTypes = {
    value: PropTypes.any
  }
  render () {
    const {
      value: arr
    } = this.props
    return arr.map((item, index) => (<Item key={index} valueKey={index} value={item} />))
  }
}
class JSObject extends Component {
  static propTypes = {
    value: PropTypes.any
  }
  render () {
    const {
      value: obj
    } = this.props
    const keys = Object.keys(obj)
    return keys.map((key) => (<Item key={key} valueKey={key} value={obj[key]} />))
  }
}

class JSValue extends Component {
  static propTypes = {
    value: PropTypes.any
  }
  constructor (props) {
    super(props)
    this.state = {
      show: false
    }
  }
  _onToggle = () => {
    this.setState({
      show: !this.state.show
    })
  }
  render () {
    const {
      value,
      style
    } = this.props
    const {
      show
    } = this.state
    if (isPrimaryType(value)) {
      return <JSPrimary style={style} value={value} />
    } else if (isArrayType(value)) {
      const str = toString(value)
      return (
        <View style={[{margin: 5}, style]}>
          <Arrow show={show} str={str} onPress={this._onToggle} />
          {show ? <Card><JSArray value={value} /></Card> : null}
        </View>
      )
    } else if (isObjectType(value)) {
      const str = toString(value)
      return (
        <View style={[{margin: 5}, style]}>
          <Arrow show={show} str={str} onPress={this._onToggle} />
          {show ? <Card><Text style={{fontSize: FONT_SIZE}}>{JSON.stringify(value, null, 2)}</Text></Card> : null}
        </View>
      )
    } else {
      return <Text style={style}>unknow</Text>
    }
  }
}

class Log extends Component {
  static propTypes = {
    logType: PropTypes.string,
    value: PropTypes.any
  }
  constructor (props) {
    super(props)
    this.state = {
      show: false
    }
  }
  _onToggle = () => {
    this.setState({
      show: !this.state.show
    })
  }
  componentDidCatch (error) {
    Console.rawConsole.log(error)
  }
  _getColor () {
    const {
      logType
    } = this.props
    if (logType === 'warn') {
      return '#FFCD36'
    } else if (logType === 'error') {
      return '#FF0000'
    }
  }
  render () {
    const {
      value
    } = this.props
    const {
      show
    } = this.state
    const str = logToString(value)
    const color = this._getColor()
    const bgColor = color ? `${color}55` : undefined
    return (
      <View style={[{backgroundColor: bgColor}, this.props.style]}>
        <Arrow color={color} show={show} str={str} onPress={this._onToggle} />
        {show ? <Card>{value.map((item, index) => <Item style={{marginTop: 5}} key={index} value={item} />)}</Card> : null}
      </View>
    )
  }
}
const logToString = (tags) => {
  let eles = []
  // Console.rawConsole.log('tags', tags, tags.length)
  for (let i = 0; i < tags.length; i += 1) {
    let tag = toString(tags[i])
    let t = tag.split('%c')
    // Console.rawConsole.log('tag', t)
    if (t.length > 1) {
      eles.push(<Text key={i}> {t[0]}</Text>)
      for (let j = 1; j < t.length; j += 1) {
        let t2 = (tags[i + j] || '').split(/:(?:\s+)?/)
        let color = (t2[1] || '').trim()
        if (!color || color.indexOf('inherit') > -1) {
          color = undefined
        }
        // Console.rawConsole.log('color', t2)
        eles.push(
          <Text key={i + '_' + j} style={{color: color}}>{t[j]}</Text>
        )
      }
      i += t.length - 1
    } else {
      eles.push(<Text key={i}> {t[0]}</Text>)
    }
  }
  return eles
}
class Group extends Component {
  static propTypes = {
    value: PropTypes.any
  }
  constructor (props) {
    super(props)
    this.state = {
      show: false
    }
  }
  _onToggle = () => {
    this.setState({
      show: !this.state.show
    })
  }
  componentDidCatch (error) {
    Console.rawConsole.log(error)
  }
  render () {
    const {
      value,
      tag
    } = this.props
    const {
      show
    } = this.state
    const str = logToString(tag)
    return (
      <View>
        <Arrow isGroup show={show} str={str} onPress={this._onToggle} />
        {show
          ? <Card>
            {value.map((item, index) => (
              <Log
                key={index}
                style={[{marginTop: 5}, index > 0 ? {borderTopWidth: realOnePixel, borderTopColor: '#AAAAAA'} : null]}
                value={item.msg}
                logType={item.logType} />
            ))}</Card>
          : null}
      </View>
    )
  }
}

export {
  Log,
  Group,
  realOnePixel
}
