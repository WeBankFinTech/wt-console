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

export default class EntryIcon extends Component {
  size = {
    iconSize: 50
  }

  state = {
    showDashboard: true
  }

  constructor (props) {
    super(props)
    this._toggleDashboard = this._toggleDashboard.bind(this)
    this.state = {
      pan: new Animated.ValueXY({
        x: 0,
        y: 100
      })
    }

    const {height, width} = Dimensions.get('window')

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: (e, gestureState) => {
        console.log('onResponderGrant')
        this.state.pan.setOffset({
          x: this.state.pan.x._value,
          y: this.state.pan.y._value
        })
      },
      onStartShouldSetPanResponder: (e, gestureState) => {
        return true
      },
      onPanResponderMove: Animated.event([null, {
        dx: this.state.pan.x,
        dy: this.state.pan.y
      }]),
      onPanResponderRelease: (e, gesture) => {
        console.log(gesture)
        this.state.pan.flattenOffset()

        let toX = 0
        if ((this.state.pan.x._value + this.size.iconSize / 2) > width / 2) {
          toX = width - this.size.iconSize
        }

        Animated.spring(            //Step 1
          this.state.pan,         //Step 2
          {
            toValue: {
              x: toX,
              y: this.state.pan.y._value
            }
          }     //Step 3
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
            }
          ]}>

          <TouchableHighlight
            style={{
              width: this.size.iconSize,
              height: this.size.iconSize,
              borderRadius: this.size.iconSize / 2,
            }}
            onPress={this._toggleDashboard}>
            <Image style={{
              width: this.size.iconSize,
              height: this.size.iconSize,
              borderRadius: this.size.iconSize / 2,
              borderWidth: 0.5,
              borderColor: '#EEE',
              backgroundColor: '#FFF'
            }} resizeMode={'contain'} source={require('./images/tianyan-icon.png')}>

            </Image>
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
          <Dashboard onPressClose={this._toggleDashboard}/>
        </View>
      )
    }
  }

  // onPress={this._toggleDashboard}>
}
