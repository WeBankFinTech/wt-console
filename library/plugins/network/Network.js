import Plugin from '../Plugin'
import { FetchLog, ProxyFetch } from '../console/utils/ProxyFetch'
import { FlatList, View } from 'react-native'
import React from 'react'
import Tab from '../../components/Tab'
import { realOnePixel } from '../console/utils/DumpObject'

const TABS = {
  Request: 'Request',
  ReRequest: 'ReRequest'
}

export default class Network extends Plugin {
  static setup (options) {
    if (Network.isProxy) {
      return
    }
    Network.isProxy = true

    // proxy fetch
    Network._proxyFetch = new ProxyFetch(window)
    Network._proxyFetch.onUpdate((fetchList) => {
      Network._fetchList = fetchList
      if (Network.currentInstance && !Network.currentInstance._isRender) {
        Network.currentInstance.setState({
          fetchList: Network._fetchList
        })
      }
    })
    // 请求重发更新
    Network._proxyFetch.onReUpdate((fetchList) => {
      Network._reFetchList = fetchList
      if (Network.currentInstance && !Network.currentInstance._isRender) {
        Network.currentInstance.setState({
          reFetchList: Network._reFetchList
        })
      }
    })
  }
  static _getFetchList () {
    if (!Network._proxyFetch) {
      return []
    }
    Network._fetchList = Network._proxyFetch.getFetchList()
    return Network._fetchList
  }
  static _getReFetchList () {
    if (!Network._proxyFetch) {
      return []
    }
    Network._reFetchList = Network._proxyFetch.getReFetchList()
    return Network._reFetchList
  }

  _renderSeparator = () => {
    return (
      <View style={{height: realOnePixel, backgroundColor: '#AAAAAA'}} />
    )
  }
  constructor (props) {
    super(props)
    this.state = {
      fetchList: Network._getFetchList(),
      reFetchList: Network._getReFetchList()
    }
    Network.currentInstance = this
  }
  _renderNetwork (logType, fetchList) {
    return {
      title: logType + `(${fetchList ? fetchList.length : 0})`,
      renderContent: () => (
        <FlatList
          key={logType}
          data={fetchList}
          renderItem={({item}) => (
            <FetchLog data={item} />
          )}
          keyExtractor={(item) => item.rid}
          ItemSeparatorComponent={this._renderSeparator}
          onEndReachedThreshold={0.5}
        />
      )
    }
  }
  render () {
    const {
      fetchList,
      reFetchList
    } = this.state
    const TAB_LIST = Object.values(TABS)
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
            if (item === TABS.Request) {
              return this._renderNetwork(item, fetchList)
            } else if (item === TABS.ReRequest) {
              return this._renderNetwork(item, reFetchList)
            }
          })}
        />
      </View>
    )
  }
}
