import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight
} from 'react-native'
import React, { Component } from 'react'

import TianYan from '@unpourtous/tianyan-react-native'

const {
  EntryIcon,
  Dashboard,
  Console
} = TianYan

export default class SimpleApp extends Component {
  constructor (props) {
    super(props)

    Dashboard.register(Console, {
      logServerUrl: 'http://23lab.com:3000/v1/log',
      maxLogLine: 1000
    })
    Dashboard.setup()
  }

  render () {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to tianyan-react-native Demo
        </Text>
        <TouchableHighlight onPress={this._onPress.bind(this)}>
          <Text style={styles.instructions}>
            First, Click Me to generate log
          </Text>

        </TouchableHighlight>

        <Text>Then click the floating icon to see your log</Text>
        <EntryIcon />
      </View>
    )
  }

  _onPress () {
    for (let i = 0; i < 1000; i++) {
      console.log('oonPress onPress onPress onPress onPress onPress onPress nPress ' + new Date().getTime())
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  }
})

