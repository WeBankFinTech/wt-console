import {
  Text,
  View,
  TouchableHighlight,
  PixelRatio,
  ListView
} from 'react-native'

import React from 'react'
import Plugin from '../../Plugin'
import Loading from './components/Loading'
import ResultBoard from './components/ResultBoard'

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
    console.log('before Console setup')
    const log = window.console.log

    Console.options = options || {}

    window.console.log = function () {
      const callStack = new Error('').stack
      let caller
      const callstackArr = callStack.split(' at ')
      if (callStack && callstackArr.length >= 2) {
        caller = callstackArr[2].split(' ')[0]
      }

      let logString = ''
      logString = Console.everyTypeToString(arguments)
      // if (arguments.length === 1) {
      //   logString = Console.everyTypeToString(arguments)
      // } else if (arguments.length >= 2 && arguments[0] && arguments[0].indexOf()) {

      // }

      const formattedLog = {
        ts: new Date().getTime(),
        msg: logString,
        type: Console.LOG_TYPE.DEBUG,
        caller
      }

      Console.addLog(formattedLog)
      log(...arguments)
    }
  }

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
    if (val !== null && typeof val === 'object') {
      return Console.strongJSONStringify(val)
    } else {
      return val
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
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF'
        }}>
        <View style={{flex: 1}}>
          <ListView
            dataSource={ds.cloneWithRows(this.state.logList)}
            enableEmptySections
            renderRow={(log) => {
              const date = new Date(log.ts)
              const formattedDate = `${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
              return (
                <TouchableHighlight
                  underlayColor={'#EEE'}
                  onPress={() => {
                    this._onPressLog.bind(this)(log)
                  }}>
                  <View
                    style={{
                      borderBottomWidth: 1 / PixelRatio.get(),
                      paddingTop: 5,
                      paddingBottom: 5,
                      flexDirection: 'row',
                      paddingLeft: 5,
                      borderColor: Console.theme.borderColorGray
                    }}>
                    <Text style={{flex: 1}}>
                      <Text
                        style={{color: 'green'}}>{formattedDate}</Text>
                      <Text
                        style={{flex: 1}}>{log.msg}</Text>
                      <Text
                        style={{color: '#AAA'}}> {log.caller || ''}</Text>
                    </Text>
                  </View>
                </TouchableHighlight>
              )
            }}
          />
        </View>

        <View
          style={{
            height: 45,
            alignSelf: 'stretch',
            borderTopWidth: 1 / PixelRatio.get(),
            borderColor: Console.theme.borderColorGray,
            flexDirection: 'row'
          }}>
          <TouchableHighlight
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
          </TouchableHighlight>
          <View
            style={{
              width: 0,
              borderRightWidth: 1 / PixelRatio.get(),
              borderColor: Console.theme.borderColorGray
            }} />
          <TouchableHighlight
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
          </TouchableHighlight>
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
      console.log(error)
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

