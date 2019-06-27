import {
  Text,
  View,
  TouchableOpacity,
  PixelRatio,
  FlatList
} from 'react-native'

import React from 'react'
import Plugin from '../Plugin'
import Loading from './components/Loading'
import ResultBoard from './components/ResultBoard'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import Log from './Log'

export default class Console extends Plugin {
  static name = 'Console'

  static cachedLogList = []
  static currentInstance = null
  static LOG_TYPE = {
    DEBUG: 1,
    WARNING: 2,
    ERROR: 3
  }
  static theme = {
    borderColorGray: '#BBC',
    borderColor: '#DDD'
  }

  state = {
    logList: [],
    showLoading: false,
    showResult: false
  }
  _tmpConsoleGroup = null
  _concatGroup = false

  static setup (options) {
    this.console = {}
    const that = this
    const methodList = ['log', 'info', 'warn', 'debug', 'error', 'groupEnd', 'groupCollapsed']

    if (!window.console) {
      window.console = {}
    } else {
      methodList.map(function (method) {
        that.console[method] = window.console[method]
      })
      that.console.time = window.console.time
      that.console.timeEnd = window.console.timeEnd
      that.console.clear = window.console.clear
      that.console.groupCollapsed = window.console.groupCollapsed
      that.console.groupEnd = window.console.groupEnd
    }

    Console.options = options || {}

    methodList.map(method => {
      let consoleLog = {
        [method]: window.console[method]
      }
      window.console[method] = (...args) => {
        const {ignoreFilter} = Console.options

        const callStack = new Error('').stack
        const callstackArr = callStack.split(' at ').map(item => item.split(' ')[0])

        const formattedLog = {
          ts: new Date().getTime(),
          msg: args,
          logType: method,
          callstackArr
        }

        if (ignoreFilter && typeof ignoreFilter === 'function' && ignoreFilter(...args)) {
          consoleLog[method](...args)
        } else {
          consoleLog[method](...args)
          Console.addLog(formattedLog)
        }
      }
    })
  }

  // TODO 用环形链表来实现这里的功能
  static addLog (formattedLog) {
    // 把groupCollapsed组合成一组
    if (formattedLog.logType === 'groupCollapsed' && !this._tmpConsoleGroup && !this._concatGroup) {
      this._tmpConsoleGroup = {
        ...formattedLog,
        logType: 'network'
      }
      this._concatGroup = true
      return
    } else if (formattedLog.logType !== 'groupEnd' && this._concatGroup) {
      this._tmpConsoleGroup = {
        ...this._tmpConsoleGroup,
        msg: [
          ...this._tmpConsoleGroup.msg,
          ...formattedLog.msg
        ]
      }
      return
    }

    const {maxLogLine = 1000} = Console.options
    if (Console.cachedLogList && Console.cachedLogList.length > maxLogLine) {
      Console.cachedLogList.splice(parseInt(maxLogLine * 0.8), maxLogLine)
    }
    Console.cachedLogList = [this._tmpConsoleGroup || formattedLog, ...Console.cachedLogList]

    if (Console.currentInstance) {
      if (Console.currentInstance.state.logList && Console.currentInstance.state.logList.length > maxLogLine) {
        Console.currentInstance.state.logList.splice(parseInt(maxLogLine * 0.8), maxLogLine)
      }

      Console.currentInstance.state.logList = [this._tmpConsoleGroup || formattedLog, ...Console.currentInstance.state.logList]
      Console.currentInstance.setState({
        logList: Console.currentInstance.state.logList
      })
    }
    if (formattedLog.logType === 'groupEnd') {
      this._tmpConsoleGroup = null
      this._concatGroup = false
    }
  }

  componentWillMount () {
    Console.currentInstance = this
    this.setState({
      logList: Console.cachedLogList
    })
  }

  componentWillUnmount () {
    Console.currentInstance = null
  }

  static everyTypeToString (val) {
    if (!arguments) {
      if (arguments.length === 1) {
        if (val !== null && typeof val === 'object') {
          return Console.strongJSONStringify(val)
        } else {
          return val
        }
      } else {

      }
    }
  }

  static strongJSONStringify (obj) {
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
  render () {
    const {logServerUrl = ''} = Console.options || {}
    const methodList = ['All', 'Warn', 'Error', 'Network']
    const logList = this.state.logList.sort((a, b) => b.ts - a.ts)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF'
        }}>
        <ScrollableTabView
          initialPage={0}
          locked
          tabBarBackgroundColor='#fff'
          tabBarTextStyle={{
            fontSize: 12,
            lineHeight: 14}}>
          {methodList.map((item, index) => {
            let consoleList = logList.filter(logItem => item === 'All' || item.toLowerCase() === logItem.logType)
            return (
              <View key={index}
                    tabLabel={item}
                    style={{
                      flex: 1,
                      alignSelf: 'stretch'
                    }}>
                <FlatList
                  data={consoleList}
                  renderItem={({item, index, separators}) => (
                    <Log log={item} rowId={index} />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            )
          })}
        </ScrollableTabView>
        <View
          style={{
            height: 45,
            alignSelf: 'stretch',
            borderTopWidth: 1 / PixelRatio.get(),
            borderColor: Console.theme.borderColorGray,
            flexDirection: 'row'
          }}>
          <TouchableOpacity
            onPress={this._onPressUpload.bind(this)}
            underlayColor={'#EEE'}
            style={{
              flex: 1
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: Console.theme.borderColorGray,
                flex: 1
              }}>
              <Text style={{
                color: '#414951'
              }}>Upload</Text>
            </View>
          </TouchableOpacity>
          <View
            style={{
              width: 0,
              borderRightWidth: 1 / PixelRatio.get(),
              borderColor: Console.theme.borderColorGray
            }} />
          <TouchableOpacity
            onPress={this._onPressClean.bind(this)}
            underlayColor={'#EEE'}
            style={{
              flex: 1
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: Console.theme.borderColorGray,
                flex: 1
              }}>
              <Text
                style={{
                  color: '#414951'
                }}>Clean</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ResultBoard
          logServerUrl={logServerUrl}
          logId={this.state.uploadedLogId}
          onPressBack={() => {
            this.setState({
              showResult: false
            })
          }}
          visibility={this.state.showResult} />
        <Loading visibility={this.state.showLoading} />
      </View>
    )
  }

  _onPressLog () {
  }

  _onPressUpload () {
    const {logServerUrl = null} = Console.options
    if (!logServerUrl) {
      console.log('You must set logServerUrl when register Console')
      return
    }
    this.setState({showLoading: true})
    fetch(logServerUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        logList: this.state.logList
      })
    }).then(response => {
      this.setState({
        showLoading: false
      })
      return response.json()
    }).then((responseJson) => {
      this.setState({
        showResult: true,
        uploadedLogId: (responseJson && responseJson.id) ? responseJson.id : ''
      })
      console.log(responseJson)
    }, error => {
      console.warn(error)
      this.setState({
        showLoading: false
      })
    })
  }

  _onPressClean () {
    Console.cachedLogList = []
    this.setState({
      logList: []
    })
  }
}

