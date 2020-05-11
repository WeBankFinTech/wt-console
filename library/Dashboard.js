import {
  View
} from 'react-native'

import React, { Component } from 'react'
import Console from './plugins/console/Console'
import ScrollableTabView from 'react-native-scrollable-tab-view'

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
        <ScrollableTabView
          initialPage={0}
          locked
          tabBarBackgroundColor="#fff"
          tabBarTextStyle={{
            fontSize: 15,
            lineHeight: 18}}
        >
          {
            /* body */
            pluginArr.map((item, index) => {
              return (
                <View
                  key={index}
                  tabLabel={item.options.tabLabel}
                  style={{
                    flex: 1,
                    alignSelf: 'stretch'
                  }}>
                  {item.element}
                </View>
              )
            })
          }
        </ScrollableTabView>
      </View>
    )
  }
}
