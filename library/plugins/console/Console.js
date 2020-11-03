import {
  Text,
  View,
  TouchableOpacity,
  PixelRatio,
  FlatList
  // Switch
} from 'react-native'

import React from 'react'
import Plugin from '../Plugin'
import Loading from './components/Loading'
import ResultBoard from './components/ResultBoard'
import { Log, Group, realOnePixel, logsToString } from '../utils/DumpObject'
import Tab from '../../components/Tab'
import Search from '../components/Search'
import { stringify } from '../utils/Json'

const TAB_LIST = ['All', 'Warn', 'Error']

let uploadInterval
let toggleIndex = -1
const uploadLogNum = 10
let isUploading = false

export default class Console extends Plugin {
  static isProxy = false

  static cachedLogList = []
  static currentInstance = null
  static theme = {
    borderColorGray: '#BBC',
    borderColor: '#DDD'
  }

  static setup (options) {
    if (Console.isProxy) {
      return
    }
    Console.isProxy = true

    // proxy console
    Console.rawConsole = {}
    const methodList = ['log', 'info', 'warn', 'debug', 'error', 'groupEnd', 'groupCollapsed']

    if (!window.console) {
      window.console = {}
    }
    methodList.forEach((method) => {
      Console.rawConsole[method] = window.console[method]
    })

    Console.options = options || {}

    methodList.forEach(method => {
      window.console[method] = (...args) => {
        // this.rawConsole.log(args)
        const {ignoreFilter} = Console.options

        // const callStack = new Error('').stack
        // const callstackArr = callStack.split(' at ').map(item => item.split(' ')[0])

        const formattedLog = {
          timestamp: Date.now(),
          msg: args,
          logType: method
        }

        const rawLog = Console.rawConsole[method]
        if (ignoreFilter && typeof ignoreFilter === 'function' && ignoreFilter(...args)) {
          rawLog(...args)
        } else {
          Console.addLog(formattedLog)
          if (
            (Console.options.ignoreRedBox && method === 'error') ||
            (Console.options.ignoreYellowBox && method === 'warn')
          ) {
            // 忽略
            return
          }
          rawLog(...args)
        }
      }
    })
  }

  static _tmpConsoleGroup = null
  static _concatGroup = false
  static _errorLogCount = 0
  static _warnLogCount = 0
  // TODO 用环形链表来实现这里的功能
  static addLog (formattedLog) {
    // 把groupCollapsed组合成一组
    // this.rawConsole.log(`formattedLog${formattedLog.logType}:`, formattedLog)
    if (formattedLog.logType === 'error' && !Console._concatGroup) {
      Console._errorLogCount += 1
    } else if (formattedLog.logType === 'warn' && !Console._concatGroup) {
      Console._warnLogCount += 1
    }
    if (formattedLog.logType === 'groupCollapsed' && !Console._tmpConsoleGroup && !Console._concatGroup) {
      Console._tmpConsoleGroup = {
        ...formattedLog,
        logList: [],
        category: 'group'
      }
      Console._concatGroup = true
      return
    } else if (formattedLog.logType !== 'groupEnd' && Console._concatGroup) {
      Console._tmpConsoleGroup = {
        ...Console._tmpConsoleGroup,
        logList: [
          ...Console._tmpConsoleGroup.logList,
          formattedLog
        ]
      }
      return
    }

    const {
      maxLogLine = 1000,
      updateErrorCount,
      ignoreRedBox,
      updateWarnCount,
      ignoreYellowBox
    } = Console.options
    if (Console.cachedLogList && Console.cachedLogList.length > maxLogLine) {
      Console.cachedLogList.splice(0, Math.floor(maxLogLine * 0.2))
    }
    Console.cachedLogList = [...Console.cachedLogList, this._tmpConsoleGroup || formattedLog]
    if (formattedLog.logType === 'groupEnd') {
      this._tmpConsoleGroup = null
      this._concatGroup = false
    }

    ignoreRedBox && updateErrorCount && updateErrorCount(Console._errorLogCount)
    ignoreYellowBox && updateWarnCount && updateWarnCount(Console._warnLogCount)
  }

  constructor (props) {
    super(props)
    Console.currentInstance = this
    this.state = {
      logList: [],
      showLoading: false,
      showResult: false,
      logListMap: {
        [TAB_LIST[0]]: [],
        [TAB_LIST[1]]: [],
        [TAB_LIST[2]]: []
      },
      searchTextMap: {
        [TAB_LIST[0]]: '',
        [TAB_LIST[1]]: '',
        [TAB_LIST[2]]: ''
      },
      toggleUpload: Console.toggleUpload || false
    }
    this._refs = {}
    this.tabName = TAB_LIST[0]
    this.preLogList = null
  }

  componentDidMount () {
    this._updateLogList()
    this._autoRefresh()
  }

  _autoRefresh () {
    this._timer = setTimeout(() => {
      if (this.preLogList !== Console.cachedLogList) {
        this.preLogList = Console.cachedLogList
        this._updateLogList()
      }
      this._autoRefresh()
    }, 500)
  }

  componentWillUnmount () {
    clearTimeout(this._timer)
  }

  _updateLogList () {
    const Warn = TAB_LIST[1].toLowerCase()
    const Error = TAB_LIST[2].toLowerCase()
    const searchText1 = this.state.searchTextMap[TAB_LIST[0]]
    const searchText2 = this.state.searchTextMap[TAB_LIST[1]]
    const searchText3 = this.state.searchTextMap[TAB_LIST[2]]

    const allList = []
    const warnList = []
    const errorList = []
    Console.cachedLogList.forEach((logItem) => {
      if (!searchText2 || logsToString(logItem.msg).join('').toLowerCase().indexOf(searchText1) > -1) {
        allList.push(logItem)
      }
      if (logItem.logType === Warn && (!searchText2 || logsToString(logItem.msg).join('').toLowerCase().indexOf(searchText2) > -1)) {
        warnList.push(logItem)
      } else if (logItem.logType === Error && (!searchText3 || logsToString(logItem.msg).join('').toLowerCase().indexOf(searchText3) > -1)) {
        errorList.push(logItem)
      }
    })
    this.setState({
      logListMap: {
        [TAB_LIST[0]]: allList,
        [TAB_LIST[1]]: warnList,
        [TAB_LIST[2]]: errorList
      }
    })
  }

  _renderSeparator = () => {
    return (
      <View style={{height: realOnePixel, backgroundColor: '#AAAAAA'}} />
    )
  }

  _onChange = (index) => {
    this.tabName = TAB_LIST[index]
  }
  _onRef = (method) => {
    return (ref) => {
      this._refs[method] = ref
    }
  }

  _gotoBottom = () => {
    this._refs[this.tabName] && this._refs[this.tabName].scrollToEnd()
  }

  _getKey = (item, index) => {
    return String(index)
  }
  _filterListBySearchText (searchText, tabName = this.tabName) {
    const logType = tabName.toLowerCase()
    const plainSearchText = searchText.toLowerCase().trim()
    let consoleList = Console.cachedLogList.filter(logItem => {
      return logType === 'all' || logType === logItem.logType
    })
    if (plainSearchText) {
      consoleList = consoleList.filter(logItem => {
        return logsToString(logItem.msg).join('').toLowerCase().indexOf(plainSearchText) > -1
      })
    }
    return consoleList
  }
  _updateListBySearchText = (searchText = '') => {
    this.setState({
      logListMap: {
        ...this.state.logListMap,
        [this.tabName]: this._filterListBySearchText(searchText)
      },
      searchTextMap: {
        ...this.state.searchTextMap,
        [this.tabName]: searchText
      }
    })
  }
  _renderHeader = () => {
    return (
      <Search
        keyboardType={'default'}
        onMaybeFinish={this._updateListBySearchText}
        onCleanText={this._updateListBySearchText}
        defaultValue={this.state.searchTextMap[this.tabName]} />
    )
  }
  _getTimestamp (item) {
    const {showTimestamp} = Console.options
    if (showTimestamp) {
      return item.timestamp
    }
  }
  _renderLog (logType) {
    const logList = this.state.logListMap[logType]
    return {
      title: logType + `(${logList.length})`,
      renderContent: () => (
        <FlatList
          key={logType}
          data={logList}
          ListHeaderComponent={this._renderHeader}
          renderItem={({item}) => (
            item.logType === 'groupCollapsed'
              ? <Group tag={item.msg} value={item.logList} timestamp={this._getTimestamp(item)} />
              : <Log value={item.msg} logType={item.logType} timestamp={this._getTimestamp(item)} />
          )}
          keyExtractor={this._getKey}
          ItemSeparatorComponent={this._renderSeparator}
          ref={this._onRef(logType)}
          onEndReachedThreshold={0.5}
        />
      )
    }
  }

  render () {
    const { logServerUrl = '' } = Console.options || {}
    const { toggleUpload } = this.state
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF'
        }}>
        <Tab
          style={{flex: 1}}
          onChangePage={this._onChange}
          initPage={0}
          pages={TAB_LIST.map((item, index) => {
            return this._renderLog(item)
          })}
        />
        <View
          style={{
            height: 45,
            alignSelf: 'stretch',
            borderTopWidth: 1 / PixelRatio.get(),
            borderColor: Console.theme.borderColorGray,
            flexDirection: 'row'
          }}>
          <TouchableOpacity
            onPress={this._gotoBottom}
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
              }}>Bottom</Text>
            </View>
          </TouchableOpacity>
          <View
            style={{
              width: 0,
              borderRightWidth: 1 / PixelRatio.get(),
              borderColor: Console.theme.borderColorGray
            }} />
          <TouchableOpacity
            onPress={this._onPressToggleUpload.bind(this)}
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
              }}>{toggleUpload ? 'StopUpload' : 'AutoUpload'}</Text>
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
          deviceId={Console.options.deviceId}
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

  _onPressUpload (startIndex, endIndex) {
    const { addToRemote, ServerHost, userId, deviceId } = Console.options
    if (addToRemote) {
      this.setState({showLoading: true})
      addToRemote(Console.cachedLogList)
        .then(() => {
          this.setState({
            showLoading: false,
            showResult: true,
            uploadedLogId: 'temp'
          })
        })
        .catch((err) => {
          this.setState({
            showLoading: false
          })
          console.error(err)
        })
    } else {
      const sessionId = `${Date.now()}-${Math.random()}`
      const logs = Console.cachedLogList
      const body = JSON.stringify({
        app_id: 'webank_app',
        user_id: userId,
        device_id: deviceId,
        session_id: sessionId,
        log_list: logs.slice(startIndex, endIndex).map(item => {
          return {
            log_time: item.timestamp,
            log_type: item.logType,
            log_format: 'json',
            log_content: stringify({title: item.msg, content: item.logList})
          }
        })
      })
      const resultParams = {
        showLoading: false,
        showResult: true
      }
      return fetch(`${ServerHost}/wt/v1/logs/add`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: body
      })
        .then(response => {
          return response.json()
        })
        .then((res) => {
          resultParams.status = 'success'
          this.setState(resultParams)
        })
        .catch(err => {
          resultParams.status = 'fail'
          this.setState(resultParams)
          console.log('wt-console add logs', err)
          isUploading = false
        })
    }
  }

  _onPressClean () {
    Console.cachedLogList = []
    this.setState({
      logList: []
    })
  }

  _onPressToggleUpload () {
    clearInterval(uploadInterval)
    toggleIndex = Console.cachedLogList.length ? Console.cachedLogList.length - 1 : 0
    const { toggleUpload: _toggleUpload } = this.state
    const toggleUpload = !_toggleUpload
    Console.toggleUpload = toggleUpload
    isUploading = toggleUpload
    this.setState({
      toggleUpload
    })

    if (isUploading) {
      // 每3秒轮训一次进行请求
      this._startUploadInterval()
    } else {
      console.log(`结束自动上报日志`)
    }
  }

  _startUploadInterval () {
    clearInterval(uploadInterval)
    console.log(`开始日志自动上报，从第${toggleIndex}条开始`)
    uploadInterval = setInterval(() => {
      if (isUploading) {
        this._loopUpload()
      } else {
        Console.toggleUpload = false
        this.setState({
          toggleUpload: false
        })
        clearInterval(uploadInterval)
        console.log(`结束自动上报日志`)
      }
    }, 3000)
  }

  _loopUpload () {
    const lastIndex = Console.cachedLogList.length - 2
    const endIndex = Math.min(lastIndex - 1, toggleIndex + uploadLogNum)
    if (endIndex > toggleIndex) {
      this._onPressUpload(toggleIndex, endIndex)
      // console.log(`上报第${toggleIndex}-${endIndex}条日志`)
    } else {
      // console.log(`当前日志上报完毕，总数：${endIndex}等待中`)
    }
    toggleIndex = endIndex
  }
}

