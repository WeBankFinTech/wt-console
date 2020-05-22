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
// import Log from './Log'
import { Log, Group, realOnePixel } from '../../DumpObject'

export default class Console extends Plugin {
  static name = 'Console'

  static isProxy = false

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
  _tmpConsoleGroup = null
  _concatGroup = false

  static setup (options) {
    if (Console.isProxy) {
      return
    }
    Console.isProxy = true
    Console.rawConsole = {}
    const methodList = ['log', 'info', 'warn', 'debug', 'error', 'groupEnd', 'groupCollapsed']

    if (!window.console) {
      window.console = {}
    }
    methodList.forEach((method) => {
      Console.rawConsole[method] = window.console[method]
    })

    Console.options = options || {}

    methodList.map(method => {
      window.console[method] = (...args) => {
        // this.rawConsole.log(args)
        const {ignoreFilter} = Console.options

        // const callStack = new Error('').stack
        // const callstackArr = callStack.split(' at ').map(item => item.split(' ')[0])

        const formattedLog = {
          ts: Date.now(),
          msg: args,
          logType: method
        }

        const rawLog = Console.rawConsole[method]
        if (ignoreFilter && typeof ignoreFilter === 'function' && ignoreFilter(...args)) {
          rawLog(...args)
        } else {
          rawLog(...args)
          Console.addLog(formattedLog)
        }
      }
    })
  }

  // TODO 用环形链表来实现这里的功能
  static addLog (formattedLog) {
    // 把groupCollapsed组合成一组
    // this.rawConsole.log(`formattedLog${formattedLog.logType}:`, formattedLog)
    if (formattedLog.logType === 'groupCollapsed' && !this._tmpConsoleGroup && !this._concatGroup) {
      this._tmpConsoleGroup = {
        ...formattedLog,
        logList: [],
        category: 'group'
      }
      this._concatGroup = true
      return
    } else if (formattedLog.logType !== 'groupEnd' && this._concatGroup) {
      this._tmpConsoleGroup = {
        ...this._tmpConsoleGroup,
        logList: [
          ...this._tmpConsoleGroup.logList,
          formattedLog
        ]
      }
      return
    }

    // const {maxLogLine = 1000} = Console.options
    // if (Console.cachedLogList && Console.cachedLogList.length > maxLogLine) {
    //   Console.cachedLogList.splice(parseInt(maxLogLine * 0.8), maxLogLine)
    // }
    Console.cachedLogList = [...Console.cachedLogList, this._tmpConsoleGroup || formattedLog]
    if (formattedLog.logType === 'groupEnd') {
      this._tmpConsoleGroup = null
      this._concatGroup = false
    }

    /* 渲染错误日志就不打印了，否则会陷入死循环 */
    if (Console.currentInstance && !Console.currentInstance._isRender) {
      // if (Console.currentInstance.state.logList && Console.currentInstance.state.logList.length > maxLogLine) {
      //   Console.currentInstance.state.logList.splice(parseInt(maxLogLine * 0.8), maxLogLine)
      // }

      let item
      if (this._tmpConsoleGroup) {
        item = this._tmpConsoleGroup
      } else {
        item = {
          ...formattedLog,
          category: formattedLog.logType
        }
      }
      // this.rawConsole.log('item:', item)
      Console.currentInstance.setState({
        logList: Console.cachedLogList
      })
    }

  }

  constructor (props) {
    super(props)
    Console.currentInstance = this
    this.state = {
      logList: Console.cachedLogList,
      showLoading: false,
      showResult: false
    }
    this._isRender = false
  }

  componentDidMount () {
    this._isRender = false
  }
  componentDidUpdate () {
    this._isRender = false
  }

  componentWillUnmount () {
    Console.currentInstance = null
  }

  _renderSeparator = () => {
    return (
      <View style={{height: realOnePixel, backgroundColor: '#AAAAAA'}} />
    )
  }

  render () {
    this._isRender = true
    const {
      logList
    } = this.state
    const {logServerUrl = ''} = Console.options || {}
    const methodList = ['All', 'Warn', 'Error', 'Network']
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
            let consoleList = logList.filter(logItem => item === 'All' || item.toLowerCase() === logItem.category)
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
                    item.logType === 'groupCollapsed'
                      ? <Group tag={item.msg} value={item.logList} />
                      : <Log value={item.msg} logType={item.logType} />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  ItemSeparatorComponent={this._renderSeparator}
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

  _onPressUpload () {
    const {logServerUrl = null, customData = null} = Console.options
    if (!logServerUrl) {
      console.log('You must set logServerUrl when register Console')
      return
    }
    this.setState({showLoading: true})
    let body = {
      logList: this.state.logList
    }
    if (customData) {
      for (let key in customData) {
        body[key] = customData[key]
      }
    }
    fetch(logServerUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
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

