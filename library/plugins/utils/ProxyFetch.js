import React, {Component} from 'react'
import {
  View,
  TouchableOpacity
} from 'react-native'
import StyleValues from './StyleValues'
import * as URL from 'url'
import Text from '../components/Text'
import Button from '../components/Button'
import { realOnePixel } from './DumpObject'

const getRid = (() => {
  let id = -1
  let reId = -1
  return (isResend) => {
    if (isResend) {
      reId += 1
      return `RR${reId}`
    } else {
      id += 1
      return `R${id}`
    }
  }
})()

class ProxyFetch {
  constructor (window) {
    this._fetchList = []
    this._reFetchList = []
    this._callback = []
    this._reCallback = []
    this.rawFetch = window.fetch.bind(window)
    window.fetch = (input, init) => {
      const newInput = input instanceof Request ? input.clone() : input
      const p = this.rawFetch(input, init)
      this._listen(newInput, init, p)
      return p
    }
  }

  getFetchList () {
    return this._fetchList
  }

  getReFetchList () {
    return this._reFetchList
  }

  clearFetchList () {
    this._fetchList = []
  }
  clearReFetchList () {
    this._reFetchList = []
  }

  onUpdate (cb) {
    this._callback.push(cb)
  }

  onReUpdate (cb) {
    this._reCallback.push(cb)
  }

  _emit (isResend) {
    if (isResend) {
      for (let cb of this._reCallback) {
        cb(Array.from(this._reFetchList))
      }
    } else {
      for (let cb of this._callback) {
        cb(this._fetchList)
      }
    }
  }

  _resBody2string (res) {
    const res2 = res.clone()
    const contentType = res2.headers.get('content-type') || ''
    if (contentType.indexOf('application/json') === 0) {
      return res2.json().then((jsonObj) => {
        // console.log(jsonObj)
        return JSON.stringify(jsonObj, null, 2)
      }).catch((err) => {
        // console.log(err.toString())
        return err.toString()
      })
    } else if (
      contentType.indexOf('text/plain') === 0 ||
      contentType.indexOf('text/html') === 0 ||
      contentType.indexOf('application/javascript') === 0 ||
      contentType.indexOf('application/xml') === 0
    ) {
      return res2.text()
    } else {
      // console.log(contentType)
      return Promise.resolve('blob data')
    }
  }

  _parseHeaders (headers) {
    let result = []
    for (let pair of headers.entries()) {
      result.push({
        key: pair[0],
        value: pair[1]
      })
    }
    return result.map((item) => `${item.key}: ${item.value}`).join('\n')
  }

  rereq (req) {
    const newReq = req.clone()
    const p = this.rawFetch(req)
    this._listen(newReq, undefined, p, true)
    return p
  }

  async _listen (input, init, p, isResend) {
    const rid = getRid(isResend)
    const req = new Request(input, init)

    let reqBody
    try {
      reqBody = await req.clone().text()
    } catch (err) {
      reqBody = String(err)
    }
    const urlInfo = URL.parse(req.url)
    const data = {
      startTimestamp: Date.now(),
      rid: rid,
      isResend: isResend,
      hostname: urlInfo.hostname,
      path: urlInfo.pathname + (urlInfo.search || ''),
      url: req.url,
      method: req.method,
      req: req,
      resend: () => this.rereq(req.clone()),
      reqHeaders: this._parseHeaders(req.headers),
      reqBody: reqBody,

      status: undefined,
      ok: undefined,
      resBody: undefined,
      error: undefined,
      isFinish: false
    }
    if (isResend) {
      this._reFetchList.push(data)
    } else {
      this._fetchList.push(data)
    }

    this._emit(isResend)
    p.then((res) => {
      data.endTimestamp = Date.now()
      return this._resBody2string(res)
        .then((bodyStr) => {
          return {
            ok: res.ok,
            status: res.status,
            body: bodyStr,
            headers: this._parseHeaders(res.headers)
          }
        })
    }).then((response) => {
      // console.log('success')
      data.isFinish = true
      data.ok = response.ok
      data.status = response.status
      data.resBody = response.body
      data.resHeaders = response.headers
      this._emit(isResend)
    }).catch((err) => {
      // console.log('fail', err)
      data.endTimestamp = Date.now()
      data.isFinish = true
      data.error = err.toString()
      this._emit(isResend)
    })
  }
}

class FetchLog extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isShow: false,
      disabled: false,
      toggleMap: {}
    }
  }
  _onToggle = () => {
    this.setState({
      isShow: !this.state.isShow
    })
  }
  _getColor ({status, isFinish}) {
    if (
      (status >= 100 && status < 200) ||
      (status >= 200 && status < 300)
    ) {
      return StyleValues.SuccessColor
    } else if (status >= 300 && status < 400) {
      return StyleValues.WarningColor
    } else if (
      (status >= 400 && status < 500) ||
      (status >= 500 && status < 600) ||
      isFinish
    ) {
      return StyleValues.ErrorColor
    } else {
      return StyleValues.GrayColor
    }
  }
  _getShowList (data) {
    const keys = ['method', 'url', 'reqHeaders', 'reqBody', 'resHeaders', 'resBody', 'error']
    const showList = [{
      key: 'time',
      value: `${(new Date(data.startTimestamp)).toLocaleString()}（${data.endTimestamp - data.startTimestamp}ms）`
    }]
    keys.forEach((key) => {
      if (typeof data[key] === 'string' && data[key]) {
        showList.push({
          key: key,
          value: data[key]
        })
      }
    })
    return showList
  }
  _getStatusDesc ({status, isFinish}) {
    if (isFinish) {
      if (status === undefined) {
        return '(failed)'
      } else {
        return status
      }
    } else {
      return '(pending)'
    }
  }
  _onPressItem (key) {
    this.setState({
      toggleMap: {
        ...this.state.toggleMap,
        [key]: !this.state.toggleMap[key]
      }
    })
  }
  _renderItemDetail = (item) => {
    return (
      <View style={{
        paddingVertical: 5,
        borderTopWidth: realOnePixel,
        borderColor: 'gray',
        flexDirection: 'row'
      }} key={item.key}>
        <Text style={{flex: 3, fontWeight: 'bold'}}>{item.key}</Text>
        <TouchableOpacity
          onPress={() => this._onPressItem(item.key)}
          activeOpacity={0.5}
          style={{flex: 10, marginLeft: 5}}
        >
          <Text numberOfLines={this.state.toggleMap[item.key] ? undefined : 1}>{this.state.toggleMap[item.key] ? item.value : item.value.replace(/[\s\n]+/g, ' ')}</Text>
        </TouchableOpacity>
      </View>
    )
  }
  onPressRequest = () => {
    const {
      data
    } = this.props
    this.setState({
      disabled: true
    })
    data.resend()
      .finally(() => {
        this.setState({
          disabled: false
        })
      })
  }
  render () {
    const {
      data
    } = this.props
    const color = this._getColor(data)

    return (
      <View>
        <TouchableOpacity onPress={this._onToggle}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5
          }}>
            <Text style={{color: color, fontWeight: 'bold', marginRight: 5}}>{data.rid}</Text>
            <Text numberOfLines={1} style={{flex: 1, color: color}}>{data.path}</Text>
            <Text style={{marginLeft: 5, color: color, fontWeight: 'bold'}}>{this._getStatusDesc(data)}</Text>
          </View>
        </TouchableOpacity>
        {this.state.isShow
          ? <View style={{
            padding: 5
          }}>
            <View style={{
              alignItems: 'flex-start'
            }}>
              <Button style={{marginBottom: 5}} disabled={this.state.disabled} text={'请求重发'} onPress={this.onPressRequest} />
            </View>
            {this._getShowList(data).map(this._renderItemDetail)}
          </View>
          : null}
      </View>
    )
  }
}

export {
  FetchLog,
  ProxyFetch
}
