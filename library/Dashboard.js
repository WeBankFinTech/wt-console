import {
  View
} from 'react-native'

import React, { Component } from 'react'
import Tab from './components/Tab'

export default class Dashboard extends Component {
  static registeredPlugins = []
  static customData = null

  static register (plugin, options, element) {
    Dashboard.registeredPlugins.push({
      plugin,
      options,
      element
    })
  }

  static setup () {
    Dashboard.registeredPlugins.filter((item) => {
      return item.plugin && item.plugin.setup
    }).forEach((item) => {
      item.plugin.setup({
        ...item.options,
        customData: {...Dashboard.customData}
      })
    })
  }

  static addCustomData (data) {
    Dashboard.customData = data
  }

  render () {
    let pluginArr = []
    Dashboard.registeredPlugins.forEach(item => {
      if (item.plugin && item.plugin.name === 'Console') {
        pluginArr.unshift(item)
      } else {
        pluginArr.push(item)
      }
    })
    return (
      <View style={{
        flex: 1
      }}>
        <Tab
          style={{flex: 1, backgroundColor: 'white'}}
          pages={pluginArr.map((item) => ({
            title: item.options.tabLabel,
            renderContent: () => item.element
          }))}
          initPage={0}
        />
      </View>
    )
  }
}
