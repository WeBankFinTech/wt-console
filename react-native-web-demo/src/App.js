import React from 'react';
import {
  View,
  Text
} from 'react-native'
import TianYan from './library'

class App extends React.Component {
  componentDidMount () {
    console.log('a normal log')
    console.error('a error log')
    console.warn('a warn log')
    console.error('a error log')
    console.log('a normal log')
    console.error('a error log')
    console.warn('a warn log')
    fetch('https://static.geetest.com/static/js/fullpage.8.9.6.js')
    fetch('https://static.geetest.com/static/js/fullpage.8.9.600.js')
    fetch('https://static.geetest.com/static/wind/sprite2x.1.5.8.png')
    fetch('https://static.geetest.com/static/js/fullpage.8.9.6.js')
  }

  render () {
    return (
      <View>
        <Text>wt-console demo</Text>
        <TianYan
          options={{
            ignoreRedBox: true,
            ignoreYellowBox: true
          }}
        />
      </View>
    )
  }
}

export default App;
