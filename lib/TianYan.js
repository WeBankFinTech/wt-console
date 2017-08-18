import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
  Animated,
  PanResponder,
  Dimensions,
  Image
} from 'react-native'

import React, { Component } from 'react'
import Dashboard from './Dashboard'
import Console from './plugins/console/Console'

export default class TianYan extends Component {
  static propTypes = {
    options: React.PropTypes.object.isRequired
  }

  static init (options) {
  }

  size = {
    iconSize: 50
  }

  state = {
    showDashboard: true
  }

  constructor (props) {
    super(props)
    const self = this
    Dashboard.register(Console, this.props.options)
    Dashboard.setup()

    this._toggleDashboard = this._toggleDashboard.bind(this)
    const {width} = Dimensions.get('window')
    this.state = {
      pan: new Animated.ValueXY({
        x: width - this.size.iconSize,
        y: 300
      })
    }
    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({
          x: self.state.pan.x._value,
          y: self.state.pan.y._value
        })
      },
      onStartShouldSetPanResponder: (e, gestureState) => {
        return true
      },
      onPanResponderMove: Animated.event([null, {
        dx: self.state.pan.x,
        dy: self.state.pan.y
      }]),
      onPanResponderRelease: (e, gesture) => {
        console.log(gesture)
        self.state.pan.flattenOffset()

        let toX = 0
        if ((this.state.pan.x._value + self.size.iconSize / 2) > width / 2) {
          toX = width - self.size.iconSize
        }

        Animated.spring(            // Step 1
          this.state.pan,         // Step 2
          {
            toValue: {
              x: toX,
              y: self.state.pan.y._value
            }
          }     // Step 3
        ).start(() => {
        })
      }
    })
  }

  _toggleDashboard () {
    this.setState({
      showDashboard: !this.state.showDashboard
    })
  }

  render () {
    if (!this.state.showDashboard) {
      return (
        <Animated.View
          {...this.panResponder.panHandlers}
          style={[
            {...this.state.pan.getLayout()},
            {
              position: 'absolute',
              width: this.size.iconSize,
              height: this.size.iconSize,
              borderRadius: this.size.iconSize / 2
            }
          ]}>

          <TouchableHighlight
            onPress={this._toggleDashboard}>
            <Image style={{
              width: this.size.iconSize,
              height: this.size.iconSize,
              borderRadius: this.size.iconSize / 2,
              borderWidth: 0.5,
              borderColor: '#EEE',
              backgroundColor: '#FFF'
            }} resizeMode={'contain'} source={require('./images/tianyan-icon.png')} />
          </TouchableHighlight>
        </Animated.View>
      )
    } else {
      return (
        <View
          style={{
            position: 'absolute',
            alignSelf: 'stretch',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            flex: 1,
            flexDirection: 'column'
          }}>
          <Dashboard onPressClose={this._toggleDashboard} />
        </View>
      )
    }
  }

  // onPress={this._toggleDashboard}>
}
