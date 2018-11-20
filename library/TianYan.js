/* eslint-disable */
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
    Dashboard.register(Console, {...this.props.options, tabLabel: '日志'}, <Console />)
    Dashboard.setup()

    this._toggleDashboard = this._toggleDashboard.bind(this)
    const {width} = Dimensions.get('window')
    this.state = {
      pan: new Animated.ValueXY({
        x: width - this.size.iconSize,
        y: 300
      }),
      expendAnim: new Animated.Value(0)
    }
    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return gestureState.dx < 1 || gestureState.dy < 1
      },
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
      isAnimationRunning: true
    })
    if (!this.state.showDashboard) {
      this.state.expendAnim.setValue(0)
      Animated.timing(this.state.expendAnim, {
        duration: 200,
        toValue: 100
      }).start(() => {
        this.setState({
          isAnimationRunning: false
        })
      })
      this.setState({
        showDashboard: !this.state.showDashboard
      })
    } else {
      this.state.expendAnim.setValue(100)
      Animated.timing(this.state.expendAnim, {
        duration: 200,
        toValue: 0
      }).start(() => {
        this.setState({
          showDashboard: !this.state.showDashboard,
          isAnimationRunning: false
        })
      })
    }
  }

  render () {
    return (
      <Animated.View
        {...(this.state.showDashboard ? {} : this.panResponder.panHandlers)}
        style={[
          {...this.state.pan.getLayout()},
          {
            position: 'absolute',
            width: this.size.iconSize,
            height: this.size.iconSize,
            borderRadius: this.size.iconSize / 2
          },
          this.state.isAnimationRunning ? {
            borderRadius: this.state.expendAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [this.size.iconSize / 2, 0],
            }),
            top: this.state.expendAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [this.state.pan.getLayout().top._value, 0],
            }),
            left: this.state.expendAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [this.state.pan.getLayout().left._value, 0],
            }),
            width: this.state.expendAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [this.size.iconSize, Dimensions.get('window').width],
            }),
            height: this.state.expendAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [this.size.iconSize, Dimensions.get('window').height],
            })
          } : {}
        ]}>


        {this.state.showDashboard ? <Animated.View
          style={{
            position: 'absolute',
            alignSelf: 'stretch',
            opacity: this.state.expendAnim.interpolate({
              inputRange: [0, 40, 100],
              outputRange: [0, 0, 1],
            }),
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            flex: 1,
            flexDirection: 'column'
          }}>
          <Dashboard onPressClose={this._toggleDashboard} />
        </Animated.View> :
          <TouchableOpacity
            style={{
              borderRadius: this.size.iconSize / 2,
            }}
            onPress={this._toggleDashboard}>
            <Animated.Image style={{
              opacity: this.state.expendAnim.interpolate({
                inputRange: [0, 40, 100],
                outputRange: [1, 0, 0],
              }),
              width: this.size.iconSize,
              height: this.size.iconSize,
              borderRadius: this.size.iconSize / 2,
              borderWidth: 0.5,
              borderColor: '#EEE',
              backgroundColor: '#FFF'
            }} resizeMode={'contain'} source={require('./images/tianyan-icon.png')} />
          </TouchableOpacity>}
      </Animated.View>
    )
  }
}
