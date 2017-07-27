import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight
} from 'react-native'
import React, { Component } from 'react'

import TianYan from '@unpourtous/tianyan-react-native'

export default class SimpleApp extends Component {
  render () {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to tianyan-react-native Demo
        </Text>
        <TouchableHighlight
          style={{
            borderWidth: 1,
            borderColor: '#AAA',
            padding: 5,
            margin: 5
          }}
          onPress={this._onPress.bind(this)}>
          <Text style={[styles.instructions]}>
            First, Click Me to generate log
          </Text>

        </TouchableHighlight>

        <Text>Then click the floating icon to see your log</Text>

        <TianYan
          options={{
            logServerUrl: 'http://23lab.com:3000/v1/log',
            maxLogLine: 1000,
            ignoreFilter: function () {
              return (arguments && arguments[0] && arguments[0].indexOf('ignored log') === 0)
            }
          }}/>
      </View>
    )
  }

  _onPress () {
    console.log('oonPress ' + new Date().getTime())
    console.log('%s %s', 'hello', 'world')
    console.log('abcd %%f %%ss %o %d %i', '100.3', 'foo', {a: 1, b: '1'}, 100, 100.10, 1000, {a: 1})

    console.log('ignored log, this will not display in tianyan dashboard')
    console.log('x ignored log, this will display in tianyan dashboard')
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

