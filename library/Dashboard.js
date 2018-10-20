import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  PixelRatio
} from 'react-native'

import React, { Component } from 'react'
import Console from './plugins/console/Console'
import ScrollableTabView from 'react-native-scrollable-tab-view'

export default class Dashboard extends Component {
  static propTypes = {
    onPressClose: React.PropTypes.func
  }
  static registeredPlugins = []

  static register (plugin, options) {
    Dashboard.registeredPlugins.push({
      plugin,
      options
    })
  }

  static setup () {
    Dashboard.registeredPlugins.filter((item) => {
      return item.plugin && item.plugin.setup
    }).forEach((item) => {
      item.plugin.setup(item.options)
    })
  }

  render () {
    return (
      <View style={{
        flex: 1
      }}>
        <View style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          height: 75
        }}>
          <TouchableOpacity style={{
            flex: 1
          }} onPress={this.props.onPressClose}>
            <View style={{
              flex: 1
            }}>
            </View>
          </TouchableOpacity>
        </View>
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
            Dashboard.registeredPlugins.map((item, index) => {
              return (
                <View
                  key={index}
                  tabLabel={item.options.tabLabel}
                  style={{
                    flex: 1,
                    alignSelf: 'stretch'
                  }}>
                  <Console />
                </View>
              )
            })
          }
        </ScrollableTabView>
      </View>
    )
  }
}
