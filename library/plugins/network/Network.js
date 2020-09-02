import Plugin from '../Plugin'
import { FetchLog, ProxyFetch } from '../utils/ProxyFetch'
import { FlatList, View } from 'react-native'
import React from 'react'
import Tab from '../../components/Tab'
import ButtonGroup from '../components/ButtonGroup'
import { realOnePixel } from '../utils/DumpObject'
import Search from '../components/Search'

const TABS = {
  Request: 'Request',
  ReRequest: 'ReRequest'
}
const TAB_LIST = Object.values(TABS)

export default class Network extends Plugin {
  static setup (options) {
    if (Network.isProxy) {
      return
    }
    Network.isProxy = true

    // proxy fetch
    Network._proxyFetch = new ProxyFetch(window)
    Network._proxyFetch.onUpdate((fetchList) => {
      if (Network.currentInstance && !Network.currentInstance._isRender) {
        Network.currentInstance._updateListBySearchText()
      }
    })
    // 请求重发更新
    Network._proxyFetch.onReUpdate((fetchList) => {
      if (Network.currentInstance && !Network.currentInstance._isRender) {
        Network.currentInstance._updateListBySearchText()
      }
    })
  }
  static _getFetchList (logType) {
    if (!Network._proxyFetch) {
      return []
    }
    return logType === TABS.Request ? Network._proxyFetch.getFetchList() : Network._proxyFetch.getReFetchList()
  }
  constructor (props) {
    super(props)
    this.state = {
      listMap: {
        [TAB_LIST[0]]: Network._getFetchList(TAB_LIST[0]),
        [TAB_LIST[1]]: Network._getFetchList(TAB_LIST[1])
      },
      searchTextMap: {
        [TAB_LIST[0]]: '',
        [TAB_LIST[1]]: ''
      }
    }
    Network.currentInstance = this
    this.buttonList = [{
      name: 'Bottom',
      onPress: this._gotoBottom
    }, {
      name: 'Clean',
      onPress: () => {
        if (this.tabName === TABS.Request) {
          Network._proxyFetch.clearFetchList()
        } else {
          Network._proxyFetch.clearReFetchList()
        }
        this.setState({
          listMap: {
            ...this.state.listMap,
            [this.tabName]: []
          }
        })
      }
    }]
    this._refs = {}
    this.tabName = TABS.Request
  }

  _updateList (logType, list) {
    this.setState({
      listMap: {
        ...this.state.listMap,
        [logType]: list
      }
    })
  }

  _updateListBySearchText = (searchText = this.state.searchTextMap[this.tabName]) => {
    const list = Network._getFetchList(this.tabName)
    this.setState({
      searchTextMap: {
        ...this.state.searchTextMap,
        [this.tabName]: searchText
      }
    })
    const plainSearchText = searchText.toLowerCase().trim()
    this._updateList(this.tabName, list.filter((data) => !plainSearchText || data.url.toLowerCase().indexOf(plainSearchText) > -1))
  }

  _renderSeparator = () => {
    return (
      <View style={{height: realOnePixel, backgroundColor: '#AAAAAA'}} />
    )
  }
  _renderHeader = () => {
    return (
      <Search
        onMaybeFinish={this._updateListBySearchText}
        onCleanText={this._updateListBySearchText}
        defaultValue={this.state.searchTextMap[this.tabName]}
      />
    )
  }
  _renderNetwork (logType) {
    const fetchList = this.state.listMap[logType]
    return {
      title: logType + `(${fetchList ? fetchList.length : 0})`,
      renderContent: () => (
        <FlatList
          key={logType}
          data={fetchList}
          renderItem={({item}) => (
            <FetchLog data={item} />
          )}
          ListHeaderComponent={this._renderHeader}
          keyExtractor={(item) => item.rid}
          ItemSeparatorComponent={this._renderSeparator}
          onEndReachedThreshold={0.5}
          ref={this._onRef(logType)}
        />
      )
    }
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
  render () {
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
          pages={TAB_LIST.map((item) => this._renderNetwork(item))}
        />
        <ButtonGroup
          list={this.buttonList}
        />
      </View>
    )
  }
}
