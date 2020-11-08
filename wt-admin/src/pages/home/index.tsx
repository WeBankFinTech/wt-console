import React, { Component } from 'react'
import axios from 'axios'

import { List, Spin, Layout, Breadcrumb, Input, Select, Form } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { serverHost } from '../../constants/enviroment'
import { titleToString, deepParseObj } from '../../services'
import JSONTree from 'react-json-tree'
import $ from 'jquery'
require('jquery-scrollstop')

const { Content } = Layout
const { Search } = Input
const { Option } = Select

let fetchTimeout
let duration = 3000

// auto filt logs
const filterList = ['This is a no-op', 'wt/v1/logs/add', 'wt-console']

const layout = {}

let LIMIT = 300

let isKeepListOnBottom = true

class Home extends Component {
  constructor (props) {
    super(props)
  }
  state = {
    data: undefined,
    logContent: '',
    deviceId: undefined,
    deviceIds: [],
    startKey: 0,
    queryObj: {}
  }
  componentDidMount () {
    moment.locale('zh-cn')
    this.requestDeviceIds()

    // cache deviceId
    const queryObj = this.parseQueryString()
    this.setState({
      deviceId: queryObj.device_id || localStorage.getItem('wt-cache-device-id') || '',
      queryObj
    })

    const listWrap = $('#listWrap')[0]
    $(listWrap).on('scrollstop', () => {
      setTimeout(() => {
        const list = $('#listWrap > div')[0]
        if (listWrap.scrollTop + listWrap.clientHeight > list.offsetHeight) {
          isKeepListOnBottom = true
        } else {
          isKeepListOnBottom = false
        }
      }, 50)
    })
  }

  componentDidUpdate (prevProps, prevState) {
    const { deviceId, logContent, data } = this.state
    if (prevState.deviceId !== deviceId || prevState.logContent !== logContent) {
      this.setState({
        data: []
      })
      if (deviceId || logContent) {
        clearTimeout(fetchTimeout)
        this.requestLogs()
      }
    }

    if (prevState.deviceId !== deviceId) {
      history.pushState({}, '', `${location.origin}${location.pathname}?device_id=${deviceId}`)
    }

    if (prevState.data !== data && data.length && isKeepListOnBottom) {
      $('#listWrap')[0].scrollTop = $('#listWrap > .ant-list')[0].offsetHeight
    }
  }
  requestDeviceIds = () => {
    axios.get(`${serverHost}/wt/v1/logs/get_device_ids`).then(ret => {
      const deviceIds = ret?.data?.data?.device_ids
      if (ret?.data?.code === 0 && deviceIds?.length) {
        this.setState({
          deviceIds
        })
      } else {
        this.setState({
          deviceIds: []
        })
      }
    })
  }
  requestLogs = (params = {}) => {
    let { deviceId, startKey = 0, logContent = this.state.logContent } = params
    if (deviceId) {
      localStorage.setItem('wt-cache-device-id', deviceId)
    } else {
      deviceId = this.state.deviceId
    }

    if (logContent !== this.state.logContent || deviceId !== this.state.deviceId) {
      this.setState({
        logContent,
        deviceId,
        startKey
      })
    }
    axios
      .get(`${serverHost}/wt/v1/logs/get`, {
        params: {
          ['app_id']: 'webank_app',
          ['log_content']: logContent,
          limit: LIMIT,
          ['start_key']: 0,
          ['device_id']: deviceId,
          ascend: -1
        }
      })
      .then(ret => {
        const oldLogs = this.state.data || []
        clearTimeout(fetchTimeout)
        if (ret?.data?.code === 0 && ret?.data?.data?.logs?.length) {
          const logs = ret.data.data.logs
          const newLogs = this._joinLogs(oldLogs, logs)
          this.setLogs(newLogs)
          fetchTimeout = setTimeout(() => {
            this.requestLogs()
          }, duration)
        } else {
          this.setLogs(oldLogs)
        }
      })
  }
  _joinLogs (oldLogs, _logs) {
    const logs = _logs.reverse()
    let newLogs = logs
    if (oldLogs.length) {
      const lastId = oldLogs[oldLogs.length - 1]._id
      const lastLogTime = oldLogs[oldLogs.length - 1].log_time
      let nextIndex = 0
      const logsLength = logs.length > 0 ? logs.length - 1 : 0
      let nextItem = logs.slice(0, logsLength).find((item, index) => {
        if (lastId === item._id) {
          nextIndex = index
          return true
        } else {
          return false
        }
      })
      const addLogs = logs.slice(0, nextIndex).filter(item => moment(item.log_time).isSameOrAfter(moment(lastLogTime)))

      const _logs = addLogs.map(item => this.parseLog(item))

      newLogs = [...oldLogs, ..._logs]
    } else {
      newLogs = newLogs.map(item => this.parseLog(item))
    }
    return newLogs.filter(item => {
      let isFilt = false
      filterList.forEach(filtItem => {
        if (item.log_content.indexOf(filtItem) !== -1) {
          isFilt = true
        }
      })
      return !isFilt
    })
  }
  parseLog = item => {
    const logTime = `${moment(item.log_time).format('llll')}:${moment(item.log_time).format('ss')}`
    let content
    let parsedData = {}
    let formatData
    try {
      const parsedLogContent = JSON.parse(item.log_content)
      let { strList: parsedTitle, color } = titleToString(parsedLogContent?.title)
      let parsedContentMaps = {}
      parsedLogContent?.content?.forEach(item => {
        const msgKey = item?.msg[0]
        const msgValue = item?.msg[1]
        parsedContentMaps[msgKey] = deepParseObj(msgValue)
      })
      parsedData = {
        [`${logTime} ${parsedTitle}`]: parsedContentMaps
      }
      formatData = this.renderJSON(parsedData, parsedTitle, color)
    } catch (error) {
      console.warn(error)
    }
    return {
      parsedData,
      formatData,
      ...item
    }
  }

  renderJSON (parsedData, parsedTitle, color) {
    return (
      <JSONTree
        data={parsedData}
        theme={'google'}
        labelRenderer={([keyPath, nodeType, expanded, expandable], a) => (
          <span style={color ? { color: `#${color}` } : null}>{keyPath}</span>
        )}
        hideRoot
      />
    )
  }

  onChangeSearch = e => {
    const debounceRequestLogs = _.debounce(this.requestLogs, 300) // 防个抖
    debounceRequestLogs({ logContent: e?.target?.value, startKey: 0 })
  }
  onChangeDeviceId = value => {
    this.requestLogs({ deviceId: value, startKey: 0 })
  }

  onBlurDeviceId = () => {
    console.log('blur')
  }

  onFocusDeviceId = () => {
    console.log('focus')
  }

  onSearchDeviceId = value => {
    console.log('search:', value)
  }
  parseQueryString = () => {
    const str = window.location.search
    let objURL = {}

    str.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), ($0, $1, $2, $3) => {
      objURL[$1] = $3
    })
    return objURL
  }

  render () {
    const { data, deviceIds, deviceId, loadingNum } = this.state
    return (
      <Layout style={{ padding: '0 24px 24px', height: '100%' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>WT-SERVER</Breadcrumb.Item>
          <Breadcrumb.Item>Find Logs</Breadcrumb.Item>
        </Breadcrumb>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Form {...layout}>
            <Form.Item label='your device'>
              {deviceId !== undefined ? (
                <Select
                  showSearch
                  style={{ width: '20vw', marginRight: 15 }}
                  placeholder='please select deviceid'
                  onChange={this.onChangeDeviceId}
                  onFocus={this.onFocusDeviceId}
                  onBlur={this.onBlurDeviceId}
                  onSearch={this.onSearchDeviceId}
                  defaultValue={deviceId}
                >
                  {/* <Option value=''> </Option> */}
                  {deviceIds.map(item => (
                    <Option key={item} value={item}>
                      {item}
                    </Option>
                  ))}
                </Select>
              ) : null}
            </Form.Item>
            <Form.Item label='search logs'>
              <Search
                style={{ width: '35vw', marginBottom: 15 }}
                placeholder='keywords'
                loading={!data}
                enterButton={'search'}
                onChange={this.onChangeSearch}
              />
            </Form.Item>
          </Form>

          <div
            id='listWrap'
            style={{
              overflowX: 'auto',
              overflowY: 'scroll',
              height: '80vh',
              marginTop: -20
            }}
          >
            {data ? (
              <List
                itemLayout='horizontal'
                dataSource={data}
                size='small'
                renderItem={(log = {}, index) => {
                  return (
                    <div
                      key={log._id + index}
                      style={{
                        borderBottom: 'solid 1px rgb(232 232 232)'
                      }}
                    >
                      {log.formatData}
                    </div>
                  )
                }}
              />
            ) : (
              <Spin />
            )}
          </div>
        </Content>
      </Layout>
    )
  }

  setLogs (logs) {
    this.setState({
      data: logs
    })
  }
}

export default Home
