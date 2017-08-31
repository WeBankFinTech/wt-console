import {
  Text,
  View,
  TouchableHighlight,
  Image
} from 'react-native'

import React, { Component } from 'react'
import Console from './plugins/console/Console'

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
      <View
        style={{
          marginTop: 18,
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'flex-start'
        }}>
        {/* Tabs */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            backgroundColor: '#F3F3F3',
            height: 45
          }}>
          {
            Dashboard.registeredPlugins.map((item, index) => {
              return (
                <View
                  key={index}
                  style={{
                    borderBottomWidth: 3,
                    borderBottomColor: '#3E82F7',
                    justifyContent: 'center',
                    paddingLeft: 5,
                    paddingRight: 5
                  }}>
                  <Text
                    style={{
                      flex: 1,
                      color: '#5A5A5A'
                    }}>{item.plugin.name || ''}</Text>
                </View>
              )
            })
          }
          <View style={{flex: 1}}/>

          <TouchableHighlight underlayColor={'#F0F0F0'} onPress={this.props.onPressClose}>
            <View style={{
              justifyContent: 'center',
              paddingLeft: 20,
              paddingRight: 10,
              flex: 1
            }}>
              <Image style={{width: 30, height: 30}} source={require('./images/close.png')}/>
            </View>
          </TouchableHighlight>
        </View>

        <View
          style={{
            justifyContent: 'flex-start',
            flex: 1
          }}>
          {
            /* body */
            Dashboard.registeredPlugins.map((item, index) => {
              return (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    alignSelf: 'stretch'
                  }}>
                  <Console />
                </View>
              )
            })
          }
        </View>
      </View>
    )
  }
}
