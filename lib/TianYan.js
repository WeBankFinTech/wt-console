import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Image
} from 'react-native'

import React, { Component } from 'react'
import Dashboard from './Dashboard'
import Console from './plugins/console/Console'

const {height, width} = Dimensions.get('window')
export default class TianYan extends Component {
  static propTypes = {
    options: React.PropTypes.object.isRequired
  }

  static init (options) {
  }

  size = {
    iconSize: 50
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
      }),
      showDashboard: false
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
        // console.log(gesture)
        self.state.pan.flattenOffset()

        let toX = 0
        if ((this.state.pan.x._value + self.size.iconSize / 2) > width / 2) {
          toX = width - self.size.iconSize
        }

        Animated.spring(
          this.state.pan,
          {
            toValue: {
              x: toX,
              y: self.state.pan.y._value > (height - self.size.iconSize) ? (height - self.size.iconSize) : self.state.pan.y._value
            }
          }
        ).start()
      }
    })
  }

  _toggleDashboard () {
    this.setState({
      showDashboard: !this.state.showDashboard
    })
  }

  shouldUpdateComponent () {
    return false
  }
  render () {
    if (this.state.showDashboard) {
      return (
        <Animated.View
          style={{
            position: 'absolute',
            zIndex: 999,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
          }}>
          <Dashboard onPressClose={this._toggleDashboard} />
        </Animated.View>
      )
    }

    if (this.state.pan.getLayout().left._value > (Dimensions.get('window').width - this.size.iconSize)) {
      this.state.pan.getLayout().left.setValue(Dimensions.get('window').width - this.size.iconSize)
    }
    if (this.state.pan.getLayout().left._value < 0) {
      this.state.pan.getLayout().left.setValue(0)
    }
    if (this.state.pan.getLayout().top._value > (Dimensions.get('window').height - this.size.iconSize)) {
      this.state.pan.getLayout().top.setValue(Dimensions.get('window').height - this.size.iconSize)
    }
    if (this.state.pan.getLayout().top._value < 0) {
      this.state.pan.getLayout().top.setValue(300)
    }

    return (
      <Animated.View {...this.panResponder.panHandlers} style={[
        this.state.pan.getLayout()
      ]}>
        <TouchableOpacity
          onPress={this._toggleDashboard}>
          <View style={{
              height: this.size.iconSize,
                width: this.size.iconSize,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }}>
            <View style={{
                width: this.size.iconSize,
                  height: this.size.iconSize,
                  borderRadius: this.size.iconSize / 2,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#FFF'
              }}>
            <Animated.Image style={{
                width: this.size.iconSize,
                height: this.size.iconSize,
                borderRadius: this.size.iconSize / 2,
              }}
              resizeMode={Image.resizeMode.stretch}
              source={require('./images/tianyan-icon.png')} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }
}
