import React, {Component} from 'react'
import {
  View,
  TouchableOpacity
} from 'react-native'
import StyleValues from './StyleValues'
import * as URL from 'url'
import Text from './Text'

const getRid = (() => {
  let id = -1
  return () => {
    id += 1
    return id
  }
})()

class ProxyFetch {
  constructor (window) {
    this._dataMap = new Map()
    this._callback = []
    const rawFetch = window.fetch
    window.fetch = (input, init) => {
      const p = rawFetch(input, init)
      this._listen(input, init, p)
      return p
    }
  }

  getDataMap () {
    return this._dataMap
  }

  onUpdate (cb) {
    this._callback.push(cb)
  }

  _emit () {
    for (let cb of this._callback) {
      cb(this._dataMap)
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

  _listen (input, init, p) {
    const rid = getRid()
    const req = (input instanceof Request) ? input : new Request(input, init)

    let reqBody
    if (init && typeof init.body === 'string') {
      reqBody = init.body
    }
    const urlInfo = URL.parse(req.url)
    const data = {
      rid: rid,
      hostname: urlInfo.hostname,
      path: urlInfo.pathname + (urlInfo.search || ''),
      url: req.url,
      method: req.method,
      reqHeaders: this._parseHeaders(req.headers),
      reqBody: reqBody,

      status: undefined,
      ok: undefined,
      resBody: undefined,
      error: undefined,
      isFinish: false
    }
    this._dataMap.set(rid, data)

    this._emit()
    p.then((res) => {
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
      this._emit()
    }).catch((err) => {
      // console.log('fail', err)
      data.isFinish = true
      data.error = err.toString()
      this._emit()
    })
  }
}

class FetchLog extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isShow: false
    }
  }
  _onToggle = () => {
    this.setState({
      isShow: !this.state.isShow
    })
  }
  _getColor (status) {
    if (
      (status >= 100 && status < 200) ||
      (status >= 200 && status < 300)
    ) {
      return StyleValues.SuccessColor
    } else if (status >= 300 && status < 400) {
      return StyleValues.WarningColor
    } else if (
      (status >= 400 && status < 500) ||
      (status >= 500 && status < 600)
    ) {
      return StyleValues.ErrorColor
    } else {
      return StyleValues.GrayColor
    }
  }
  _getShowList (data) {
    const keys = ['method', 'url', 'reqHeaders', 'reqBody', 'resHeaders', 'resBody', 'error']
    const showList = []
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
  _getStatusDesc (status) {
    if (status === undefined) {
      return 'pending'
    } else {
      return status
    }
  }
  _renderItemDetail (item) {
    return (
      <View style={{
        flexDirection: 'row',
        padding: 5
      }} key={item.key}>
        <Text style={{flex: 3, fontWeight: 'bold'}}>{item.key}</Text>
        <Text style={{flex: 10, wordBreak: 'break-all'}}>{item.value}</Text>
      </View>
    )
  }
  render () {
    const {
      data
    } = this.props
    const color = this._getColor(data.status)

    return (
      <View>
        <TouchableOpacity onPress={this._onToggle}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5
          }}>
            <Text numberOfLines={1} style={{flex: 1, color: color}}>{data.path}</Text>
            <Text style={{marginLeft: 5, color: color, fontWeight: 'bold'}}>{this._getStatusDesc(data.status)}</Text>
          </View>
        </TouchableOpacity>
        {this.state.isShow
          ? <View>
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
