import React, {Component} from 'react'
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native'

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

  onUpdate (cb) {
    this._callback.push(cb)
  }

  _emit () {
    for (let cb of this._callback) {
      cb(this._dataMap)
    }
  }

  _reqBody2string (res) {
    const contentType = res.headers.get('content-type') || ''
    if (contentType.indexOf('application/json') === 0) {
      return res.json().then((jsonObj) => {
        return JSON.stringify(jsonObj, null, 2)
      })
    } else if (
      contentType.indexOf('text/plain') === 0 ||
      contentType.indexOf('text/html') === 0
    ) {
      return res.body.text()
    } else {
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
    const data = {
      rid: rid,
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
      return this._reqBody2string(res)
        .then((bodyStr) => {
          return {
            ok: res.ok,
            status: res.status,
            body: bodyStr
          }
        })
    }).then((response) => {
      console.log('success')
      data.isFinish = true
      data.ok = response.ok
      data.status = response.status
      data.resBody = response.body
      this._emit()
    }).catch((err) => {
      console.log('fail', err)
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
  render () {
    const {
      data
    } = this.props

    return (
      <TouchableOpacity onPress={this._onToggle}>
        <View style={{
          flexDirection: 'row',
          align: 'center'
        }}>
          <Text numberOfLines={2} style={{flex: 1}}>{data.url}</Text>
          <Text>{data.status}</Text>
        </View>
        {this.state.isShow
          ? <View>
            {Object.keys(data).map((key) => {
              const value = data[key]
              return (
                <View style={{
                  flexDirection: 'row',
                  align: 'center'
                }} key={key}>
                  <Text style={{flex: 1}}>{key}</Text>
                  <Text style={{flex: 5}}>{value}</Text>
                </View>
              )
            })}
          </View>
          : null}
      </TouchableOpacity>
    )
  }
}

// const proxyFetch = new ProxyFetch(window)
// proxyFetch.onUpdate((fetchMap) => {
//   const showList = []
//   fetchMap.forEach((data) => {
//     showList.push({
//       isFinish: data.isFinish,
//       rid: data.rid,
//       url: data.url,
//       method: data.method,
//       status: data.status,
//       ok: data.ok,
//       reqBody: data.reqBody,
//       resBody: data.resBody,
//       error: data.error
//     })
//   })
//   console.log(JSON.stringify(showList, null, 2))
// })
//
// fetch('https://developer.mozilla.org/zh-CN/docs/Web/API/Headers')

export {
  FetchLog,
  ProxyFetch
}
