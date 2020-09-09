import React from 'react';
import {
  View,
  Text
} from 'react-native'
import TianYan from './library'

class App extends React.Component {
  componentDidMount () {
    const data = {
      name: 'wt-console',
      version: 'x.x.x',
      desc: 'A lightweight, extendable debug tool for React Native'
    }
    console.log('a normal log', data)
    console.error('a error log', data)
    console.warn('a warn log', data)
    console.log('%ca normal log with custom style', 'color: crimson;')
    console.groupCollapsed('a group logs')
    console.log('item 1')
    console.warn('item 2')
    console.error('item 3')
    console.groupEnd()
    fetch('https://reactjs.org/docs/getting-started.html')
    fetch('https://static.geetest.com/static/js/fullpage.8.9.600.js')
    fetch('https://static.geetest.com/static/wind/sprite2x.1.5.8.png')
    fetch('https://static.geetest.com/static/js/fullpage.8.9.6.js')
    setInterval(() => {
      fetch('https://static.geetest.com/static/js/fullpage.8.9.6.js?ts=' + new Date().getTime())
      console.log('some log ' + new Date().getTime())
      console.warn('some warning ' + new Date().getTime())
      console.error('some error ' + new Date().getTime())
    }, 5000)
  }

  render () {
    return (
      <View>
        <Text>wt-console demo</Text>
        <TianYan
          consoleOptions={{
            showTimestamp: true,
            ignoreRedBox: true,
            ignoreYellowBox: true
          }}
        />
      </View>
    )
  }
}

export default App
