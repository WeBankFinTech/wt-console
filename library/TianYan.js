import {
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  View
} from 'react-native'

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Dashboard from './Dashboard'
import Console from './plugins/console/Console'

const { width, height } = Dimensions.get("window");
const ICON_SIZE = 50
const LEFT_X = 0
const RIGHT_X = width - ICON_SIZE
export default class TianYan extends Component {
  static propTypes = {
    options: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)
    Dashboard.register(Console, {...this.props.options, tabLabel: '日志'}, <Console />)
    Dashboard.setup()

    this.state = {
      expendAnim: new Animated.Value(100),
      pan: new Animated.ValueXY({
        x: RIGHT_X,
        y: 300
      })
    }
    this.x = RIGHT_X
    this.y = 300
    this.isFold = true

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: this._onPanResponderGrant,
      onPanResponderMove: this._onPanResponderMove,
      onPanResponderRelease: this._onPanResponderRelease
    })
  }

  _onPanResponderGrant = ({nativeEvent: {timestamp}}, gestureState) => {
    this.startTime = timestamp
    this.state.pan.setOffset({
      x: this.x,
      y: this.y
    })
    this.state.pan.setValue({ x: 0, y: 0 })
  }

  _onPanResponderMove = (evt, gestureState) => {
    // console.log('x, y', gestureState.dx, gestureState.dy)
    Animated.event(
      [
        null,
        {
          dx: this.state.pan.x,
          dy: this.state.pan.y
        }
      ]
    )(evt, gestureState)
  }
  _onPanResponderRelease = ({nativeEvent: {timestamp}}, gestureState) => {
    this.state.pan.flattenOffset()
    let time = timestamp - this.startTime
    // console.log('time: ' + time)
    if (
      time < 500 &&
      Math.abs(gestureState.dx) < 10 &&
      Math.abs(gestureState.dy) < 10
    ) {
      // 单击
      this._toggleDashboard()
    } else if (
      time > 500 &&
      Math.abs(gestureState.dx) < 10 &&
      Math.abs(gestureState.dy) < 10
    ) {
      // 长按没有移动，do noting
    } else {
      this.x = gestureState.moveX > width * 0.5 ? RIGHT_X : LEFT_X
      const y = this.state.pan.y._value
      const min = 30
      const max = height - ICON_SIZE
      if (y < min) {
        this.y = min
      } else if (y > max) {
        this.y = max
      } else {
        this.y = y
      }
      // console.log('x, y', this.x, this.y)
      Animated.parallel([
        Animated.spring(this.state.pan.x, {
          toValue: this.x,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.spring(this.state.pan.y, {
          toValue: this.y,
          duration: 200,
          useNativeDriver: true
        })
      ]).start()
    }
  }
  _toggleDashboard = () => {
    if (this.isFold) {
      // 展开
      this.isFold = false
      this.state.expendAnim.setValue(100)
      Animated.timing(this.state.expendAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start()
    } else {
      // 隐藏
      this.isFold = true
      this.state.expendAnim.setValue(0)
      Animated.timing(this.state.expendAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true
      }).start()
    }
  }

  _getEyeAnimatedStyle () {
    return {
      transform: [{
        translateX: this.state.pan.x
      }, {
        translateY: this.state.pan.y
      }],
      opacity: this.state.expendAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
      })
    }
  }

  _getDashboardAnimatedStyle () {
    return {
      opacity: this.state.expendAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0],
      }),
      transform: [{
        translateY: this.state.expendAnim.interpolate({
          inputRange: [0, 100],
          outputRange: [0, height]
        })
      }]
    }
  }

  render () {
    return [
      <Animated.View
        key={'eye'}
        {...this.panResponder.panHandlers}
        style={[{
          position: 'absolute',
          top: 0,
          left: 0,
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: ICON_SIZE / 2
        }, this._getEyeAnimatedStyle()]}>
        <Animated.Image
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
          }}
          resizeMode={'contain'}
          source={require('./images/tianyan-icon.png')}
        />
      </Animated.View>,
      <Animated.View
        key={'dashboard'}
        style={[{
          position: 'absolute',
          top: 0,
          left: 0,
          width: width,
          height: height
        }, this._getDashboardAnimatedStyle()]}>
        <View style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          height: 75
        }}>
          <TouchableOpacity style={{
            flex: 1
          }} onPress={this._toggleDashboard}>
            <View style={{
              flex: 1
            }}>
            </View>
          </TouchableOpacity>
        </View>
        <Dashboard />
      </Animated.View>
    ]
  }
}
