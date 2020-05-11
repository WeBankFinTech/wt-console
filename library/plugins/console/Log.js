/**
 * Created by yatesmiao on 2018/11/3.
 */
import {
  Text,
  View,
  TouchableOpacity,
  PixelRatio,
  Clipboard
} from 'react-native'

import React from 'react'
import Plugin from '../Plugin'
import {getDate, isArray, isBoolean, isString, isObject,isNumber, JSONStringify, getObjName} from './utils'
import PropTypes from 'prop-types'
import JSONTree from "react-native-json-tree";

export default class Log extends Plugin {
  static propTypes = {
    log: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]).isRequired,
    owId: PropTypes.string
  }
  constructor (props) {
    super(props)

    this.state = {
      callStackExpandable: true,
      logExpandable: true
    }
  }

  _parseBgColor (logType, rowId) {
    const methodList = ['warn', 'error']
    const bgColor = ['#fffacd', '#ffe4e1']
    const borderColor = ['#ffb930', '#f4a0ab']

    if (methodList.indexOf(logType) !== -1) {
      return {
        backgroundColor: bgColor[methodList.indexOf(logType)],
        borderColor: borderColor[methodList.indexOf(logType)]
      }
    } else {
      return {
        backgroundColor: rowId % 2 === 1 ? '#ffffff' : '#f0f0f0',
        borderColor: '#b0b0c1'
      }
    }
  }
  _parseFontColor (logType) {
    const methodList = ['log', 'info', 'warn', 'debug', 'error']
    const color = ['#414951', '#6a5acd', '#FFA500', '#414951', '#dc143c']

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
        : <Text style={{color: '#8B0000'}}>{log}</Text>
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
    return <View style={{flex: 1}} key={key}>
      {element}
    </View>
  }
  _renderSimple (log, showType) {
    let outer = null
    let json = JSONStringify(log, '')
    if (json) {
      let preview = json.substr(0, 40)
      preview = preview.replace(/"([^"]+(?="))"/g, '$1')
      outer = showType ? getObjName(log) : ''
      if (json.length > 40) {
        preview += '...'
      }
      outer += ' ' + preview
    }
    return <Text>{outer}</Text>
  }
  _renderLog (log) {
    const theme = {
      scheme: 'monokai',
      author: 'wimer hazenberg (http://www.monokai.nl)',
      base00: '#27282200'
    };
    let element = null
    if (log && isArray(log)) {
      element = log.map((item, index) => {
        let simple = this._renderSimple(item, false)
        let _element = this.state.logExpandable ? null : this._renderLogForEachType(item, 'renderlogObj')
        return <TouchableOpacity key={'touchablerendertb' + index} onPress={() => { this.toggleLogExpandable() }}>
          {this.state.logExpandable
            ? <View><Text> ▸ {simple}</Text></View>
            : <View style={{
              flexDirection: 'row',
              flex: 1
            }}>
              <Text> ▾ </Text>
              {_element}
            </View>}
        </TouchableOpacity>
      })
    }
    let simple = this._renderSimple(log[0], false)

    return <View style={{flex: 1}}>
      <View><Text>{simple}</Text></View>
      <JSONTree
        invertTheme={false}
        style={{...this._parseBgColor(log.logType, 1)}}
        theme={theme}
        shouldExpandNode={() => false}
        data={log}/>
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
  copyLog (log) {
    Clipboard.setString(JSON.stringify(log));
  }
  _renderCallStack (callstackArr) {
    let simple = this._renderSimple(callstackArr)
    let element = this.state.callStackExpandable ? null : this._renderLogForEachType(callstackArr)
    return <TouchableOpacity style={{
      paddingVertical: 5,
      marginTop: 10,
      borderTopWidth: 1 / PixelRatio.get()
    }} onPress={() => { this.toggleCallStackExpandable() }}>
      {this.state.callStackExpandable
        ? <View><Text>callStack ▸ {simple}</Text></View>
        : <View><Text>callStack ▾ {simple}</Text></View>}
      {element}
    </TouchableOpacity>
  }
  _renderTime (ts) {
    const date = getDate(ts)
    const formattedDate = `${date.year}-${date.month}-${date.day} ${date.hour}:${date.minute}:${date.second}.${date.millisecond}`
    return <Text style={{color: 'green'}}>{formattedDate}</Text>
  }
  _renderCopyBtn (log) {
    return <TouchableOpacity style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 20,
      width: 50,
      borderWidth: 1,
      borderColor: 'green',
      borderRadius: 21
    }} onPress={() => { this.copyLog(log) }}>
      <View><Text style={{color: 'green'}}>复制</Text></View>
    </TouchableOpacity>
  }
  render () {
    const {log, rowId} = this.props
    return (
      <View
        style={{
          borderBottomWidth: 1 / PixelRatio.get(),
          paddingBottom: 5,
          paddingHorizontal: 5,
          ...this._parseBgColor(log.logType, rowId)
        }}>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
          paddingVertical: 5,
          borderBottomWidth: 1 / PixelRatio.get(),
          borderColor: '#d2d2e3'
        }}>
          {this._renderTime(log.ts)}
          {this._renderCopyBtn(log)}
        </View>
        {this._renderLog(log.msg)}
      </View>
    )
  }
}

