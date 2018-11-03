/**
 * Created by yatesmiao on 2018/11/3.
 */
import {
  Text,
  View,
  TouchableOpacity,
  PixelRatio
} from 'react-native'

import React from 'react'
import Plugin from '../Plugin'
import {getDate, isArray, isBoolean, isString, isFunction, isUndefined, isNull, isObject, isSymbol, isNumber, JSONStringify, getObjName} from './utils'
export default class Log extends Plugin {
  static propTypes = {
    log: React.PropTypes.object.isRequired,
    sectionId: React.PropTypes.string,
    owId: React.PropTypes.string
  }
  constructor (props) {
    super(props)

    const date = getDate()
    const formattedDate = `${date.month}-${date.day} ${date.hour}:${date.minute}:${date.second}`

    this.state = {
      callStackExpandable: true,
      logExpandable: true,
      formattedDate
    }
  }

  _parseBgColor (logType) {
    const methodList = ['log', 'info', 'warn', 'debug', 'error']
    const bgColor = ['#fff', '#fff', '#FFFACD', '#fff', '#FFE4E1']
    const borderColor = ['#BBC', '#BBC', '#FFB930', '#BBC', '#F4A0AB']

    if (methodList.indexOf(logType) !== -1) {
      return {
        backgroundColor: bgColor[methodList.indexOf(logType)],
        borderColor: borderColor[methodList.indexOf(logType)]
      }
    } else {
      return {
        backgroundColor: bgColor[0],
        borderColor: borderColor[0]
      }
    }
  }
  _parseFontColor (logType) {
    const methodList = ['log', 'info', 'warn', 'debug', 'error']
    const color = ['#414951', '#6A5ACD', '#FFA500', '#414951', '#DC143C']

    if (methodList.indexOf(logType) !== -1) {
      return {
        color: color[methodList.indexOf(logType)]
      }
    } else {
      return {
        color: color[0]
      }
    }
  }
  _renderLogForEachType (log, key, objectKey) {
    let element = null
    if (isArray(log)) {
      element = log.map((item, index) => this._renderLogForEachType(item, '#_renderLogForEachType' + index, String(index)))
    } else if (isString(log)) {
      element = objectKey
        ? <Text><Text style={{color: '#800080'}}>{objectKey}</Text>: <Text style={{color: '#8B0000'}}>"{log}"</Text></Text>
        : <Text style={{color: '#8B0000'}}>"{log}"</Text>
    } else if (isNumber(log)) {
      element = objectKey
        ? <Text><Text style={{color: '#800080'}}>{objectKey}</Text>: <Text style={{color: '#4169E1'}}>{log}</Text></Text>
        : <Text style={{color: '#4169E1'}}>{log}</Text>
    } else if (isObject(log)) {
      element = []
      for (let i in log) {
        element.push(this._renderLogForEachType(log[i], '#_renderLogForEachTypeObj' + i, String(i)))
      }
    } else if (isBoolean(log)) {
      element = <Text style={{color: '#800080'}}>{JSON.stringify(log)}</Text>
    }
    return <View key={key}>
      {element}
    </View>
  }
  _renderSimple (log, showType) {
    let outer = null
    let json = JSONStringify(log, '')
    if (json) {
      let preview = json.substr(0, 26)
      outer = showType ? getObjName(log) : ''
      if (json.length > 26) {
        preview += '...'
      }
      outer += ' ' + preview
    }
    return <Text>{outer}</Text>
  }
  _renderLog (log) {
    let element = null
    if (log && isArray(log)) {
      element = log.map((item, index) => {
        let simple = this._renderSimple(item, false)
        let _element = this.state.logExpandable ? null : this._renderLogForEachType(item, 'renderlogObj')
        return <TouchableOpacity key={'touchablerendertb' + index} onPress={() => { this.toggleLogExpandable() }}>
          {this.state.logExpandable ? <View><Text> ▸ {simple}</Text></View> : <View><Text> ▾ {simple}</Text></View>}
          {_element}
        </TouchableOpacity>
      })
    }
    return <View>
      {element}
    </View>
  }
  toggleCallStackExpandable () {
    this.setState(prevState => ({
      callStackExpandable: !prevState.callStackExpandable
    }))
  }
  toggleLogExpandable () {
    this.setState(prevState => ({
      logExpandable: !prevState.logExpandable
    }))
  }
  _renderCallStack (callstackArr) {
    let simple = this._renderSimple(callstackArr)
    let element = this.state.callStackExpandable ? null : this._renderLogForEachType(callstackArr)
    return <TouchableOpacity onPress={() => { this.toggleCallStackExpandable() }}>
      {this.state.callStackExpandable ? <View><Text>callStack ▸ {simple}</Text></View> : <View><Text>callStack ▾ {simple}</Text></View>}
      {element}
    </TouchableOpacity>
  }
  _renderTime (formattedDate) {
    return <Text style={{color: 'green'}}>{formattedDate}</Text>
  }
  render () {
    const {log, sectionId, rowId} = this.props
    const {formattedDate} = this.state
    return (
      <View
        style={{
          borderBottomWidth: 1 / PixelRatio.get(),
          paddingTop: 5,
          paddingBottom: 5,
          paddingLeft: 5,
          ...this._parseBgColor(log.logType)
        }}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          {this._renderTime(formattedDate)}
          {/*{this._renderCallStack({a: 1, b: 2})}*/}
          {this._renderCallStack(log.callstackArr)}
        </View>
        {this._renderLog(log.msg)}
      </View>
    )
  }
}

