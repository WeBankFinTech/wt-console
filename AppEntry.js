import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import React, { Component } from 'react'

import TianYan from './library/index'

export default class AppEntry extends Component {
  render () {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to tianyan-react-native Demo
        </Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: '#AAA',
            padding: 10,
            margin: 10,
            borderRadius: 5
          }}
          onPress={this._onPress.bind(this)}>
          <Text style={[styles.instructions]}>
            Click me to generate log
          </Text>

        </TouchableOpacity>

        <Text>Then click the floating icon to see your log</Text>

        <TianYan
          options={{
            logServerUrl: 'http://hk.23lab.com:3000/v1/log',
            maxLogLine: 1000,
            ignoreFilter: function () {
              return (arguments && typeof arguments[0] === 'string' && arguments[0].indexOf('ignored log') === 0)
            }
          }} />
      </View>
    )
  }

  _onPress () {
    let i = 1000
    while (i--) {
      // console.log('oonPress ' + new Date().getTime())
      // console.log('%s %s', 'hello', 'world')
      // console.log('%o %i', {a: 1, b: 2, c: {a: 'foo', d: 'bar'}}, 1000)
      // console.log(undefined, 'second params')
      console.log('ignored log, this will not display in tianyan dashboard')
      console.log({a: 1, b: 2, c: {a: 'foo', d: 'bar'}})
      // console.log('x ignored log, this will display in tianyan dashboard')
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

