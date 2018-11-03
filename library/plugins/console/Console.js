import {
  Text,
  View,
  TouchableOpacity,
  PixelRatio,
  ListView
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

  static setup (options) {
    this.console = {}
    const that = this
    const methodList = ['log', 'info', 'warn', 'debug', 'error']

    if (!window.console) {
      window.console = {}
    } else {
      methodList.map(function (method) {
        that.console[method] = window.console[method]
      })
      that.console.time = window.console.time
      that.console.timeEnd = window.console.timeEnd
      that.console.clear = window.console.clear
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
    const {maxLogLine = 1000} = Console.options
    if (Console.cachedLogList && Console.cachedLogList.length > maxLogLine) {
      Console.cachedLogList.splice(parseInt(maxLogLine * 0.8), maxLogLine)
    }
    Console.cachedLogList = [formattedLog, ...Console.cachedLogList]

    if (Console.currentInstance) {
      if (Console.currentInstance.state.logList && Console.currentInstance.state.logList.length > maxLogLine) {
        Console.currentInstance.state.logList.splice(parseInt(maxLogLine * 0.8), maxLogLine)
      }

      Console.currentInstance.state.logList = [formattedLog, ...Console.currentInstance.state.logList]
      Console.currentInstance.setState({
        logList: Console.currentInstance.state.logList
      })
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
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    const {logServerUrl = ''} = Console.options || {}
    const methodList = ['All', 'Log', 'Info', 'Warn', 'Error']

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
            return (
              <View key={index}
                    tabLabel={item}
                    style={{
                      flex: 1,
                      alignSelf: 'stretch'
                    }}>
                <ListView
                  dataSource={ds.cloneWithRows(this.state.logList.filter(logItem => item === 'All' || item.toLowerCase() === logItem.logType))}
                  enableEmptySections
                  renderRow={(log, sectionId, rowId) => (<Log log={log} sectionId={sectionId} rowId={rowId} />)}
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

