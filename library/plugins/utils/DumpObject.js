import React, {Component} from 'react'
import {
  View,
  TouchableOpacity,
  PixelRatio,
  Clipboard,
  StyleSheet
} from 'react-native'
import PropTypes from 'prop-types'
import {isColor, parseCSSStyle} from './isColor'
import {MonospaceText as Text} from '../components/Text'

const realOnePixel = 1 / PixelRatio.get()
const logsToString = (tags) => {
  let strList = []
  // Console.rawConsole.log('tags', tags, tags.length)
  for (let i = 0; i < tags.length; i += 1) {
    let tag = toString(tags[i], 2)
    let t = tag.split('%c')
    // Console.rawConsole.log('tag', t)
    if (t.length > 1) {
      let str = t[0]
      for (let j = 1; j < t.length; j += 1) {
        str += t[j]
      }
      strList.push(str)
      i += t.length - 1
    } else {
      strList.push(t[0])
    }
  }
  return strList
}
const logToString = (tags, timestamp) => {
  const eles = []
  if (timestamp !== undefined) {
    const t = new Date(timestamp)
    eles.push(
      <Text
        key={timestamp}
        style={[styles.text, {
          color: 'gray',
          fontWeight: 'normal'
        }]}>{t.getHours()}:{t.getMinutes()}:{t.getSeconds()}.{String(t.getMilliseconds()).padStart(3, '0')} </Text>
    )
  }
  // Console.rawConsole.log('tags', tags, tags.length)
  for (let i = 0; i < tags.length; i += 1) {
    let tag = toString(tags[i])
    let t = tag.split('%c')
    // Console.rawConsole.log('tag', t)
    if (t.length > 1) {
      eles.push(<Text style={styles.text} key={i}>{t[0]} </Text>)
      for (let j = 1; j < t.length; j += 1) {
        const style = parseCSSStyle(tags[i + j], ['color'])
        let color
        if (style.color && isColor(style.color)) {
          color = style.color
        }
        // Console.rawConsole.log('color', t2)
        eles.push(
          <Text key={i + '_' + j} style={[styles.text, {color: color}]}>{t[j]}</Text>
        )
      }
      i += t.length - 1
    } else {
      eles.push(<Text style={styles.text} key={i}>{t[0]} </Text>)
    }
  }
  return eles
}

const JSPrimaryTypes = {
  undefined: 'undefined',
  null: 'null',
  number: 'number',
  string: 'string',
  boolean: 'boolean',
  symbol: 'symbol'
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
const toString = (value, space) => {
  try {
    let str = isPrimaryType(value) ? String(value) : JSON.stringify(value, null, space)
    return str || 'unknow value'
  } catch (err) {
    return err.toString()
  }
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

class Copy extends Component {
  static propTypes = {
    log: PropTypes.any
  }
  copy = () => {
    let str = toString(this.props.log, 2)
    Clipboard.setString(str)
  }
  render () {
    return (
      <TouchableOpacity
        onPress={this.copy}
        activeOpacity={0.5}
        style={{
          justifyContent: 'center',
          marginRight: 5,
          paddingVertical: 5,
          paddingHorizontal: 10,
          backgroundColor: '#DDDDDD',
          borderRadius: 5
        }}
      >
        <Text style={[styles.text, {fontWeight: 'bold', color: 'crimson'}]}>Copy</Text>
      </TouchableOpacity>
    )
  }
}

class Arrow extends Component {
  render () {
    const {
      show,
      str,
      log
    } = this.props
    return (
      <View style={{flexDirection: 'row', marginVertical: 5}}>
        <TouchableOpacity
          onPress={this.props.onPress}
          activeOpacity={0.5}
          style={{flex: 1}}
        >
          <View style={{flexDirection: 'row'}}>
            <Text style={[styles.text, {marginRight: 5}]}>{show ? '👇' : '👉️'}</Text>
            <Text
              style={[styles.text, {flex: 1, color: this.props.color}, this.props.isGroup ? {fontWeight: 'bold'} : null]}
              numberOfLines={show && this.props.isGroup ? undefined : 1}>{str}</Text>
          </View>
        </TouchableOpacity>
        {show ? <Copy log={log} /> : null}
      </View>
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
      <Text style={[styles.text, style]}>{pv.toString()}</Text>
    )
  }
}
class Item extends Component {
  render () {
    return (
      <View style={[{
        flexDirection: 'row'
      }, this.props.style]}>
        {this.props.valueKey !== undefined ? <Text style={styles.text}>{this.props.valueKey}: </Text> : null}
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
          <Arrow show={show} str={str} log={value} onPress={this._onToggle} />
          {show ? <Card><JSArray value={value} /></Card> : null}
        </View>
      )
    } else if (isObjectType(value)) {
      const str = toString(value)
      return (
        <View style={[{margin: 5}, style]}>
          <Arrow show={show} str={str} log={value} onPress={this._onToggle} />
          {show ? <Card><Text style={styles.text}>{JSON.stringify(value, null, 2)}</Text></Card> : null}
        </View>
      )
    } else {
      return <Text style={[styles.text, style]}>unknow</Text>
    }
  }
}

class Log extends Component {
  static propTypes = {
    logType: PropTypes.string,
    value: PropTypes.any,
    timestamp: PropTypes.number
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
    // Console.rawConsole.log(error)
  }
  _getColor () {
    const {
      logType
    } = this.props
    if (logType === 'warn') {
      return 'rgb(94, 61, 12)'
    } else if (logType === 'error') {
      return 'rgb(255, 6, 27)'
    }
  }
  _getBgColor () {
    const {
      logType
    } = this.props
    if (logType === 'warn') {
      return 'rgb(255, 251, 231)'
    } else if (logType === 'error') {
      return 'rgb(255, 240, 240)'
    }
  }
  render () {
    const {
      value,
      timestamp
    } = this.props
    const {
      show
    } = this.state
    const str = logToString(value, timestamp)
    const color = this._getColor()
    const bgColor = color ? this._getBgColor() : undefined
    return (
      <View style={[{backgroundColor: bgColor}, this.props.style]}>
        <Arrow color={color} show={show} str={str} log={logsToString(value).join(' ')} onPress={this._onToggle} />
        {show ? <Card>{value.map((item, index) => <Item style={{marginTop: 5}} key={index} value={item} />)}</Card> : null}
      </View>
    )
  }
}

class Group extends Component {
  static propTypes = {
    tag: PropTypes.any,
    value: PropTypes.any,
    timestamp: PropTypes.number
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
    // Console.rawConsole.log(error)
  }
  _toString (tag, list) {
    return `\
group: ${logsToString(tag).join(' ')}
==========
${list.map((item) => {
  return `${logsToString(item.msg).join(' ')}`
}).join('\n==========\n')}`
  }
  render () {
    const {
      value,
      tag,
      timestamp
    } = this.props
    const {
      show
    } = this.state
    const str = logToString(tag, timestamp)
    return (
      <View>
        <Arrow isGroup show={show} str={str} log={this._toString(tag, value)} onPress={this._onToggle} />
        {show
          ? <Card>
            {value.map((item, index) => (
              <Log
                key={index}
                style={{marginTop: 5, borderTopWidth: realOnePixel, borderTopColor: '#AAAAAA'}}
                value={item.msg}
                logType={item.logType}
                timestamp={item.timestamp} />
            ))}</Card>
          : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    lineHeight: 18
  }
})

export {
  Log,
  Group,
  realOnePixel,
  logsToString
}
