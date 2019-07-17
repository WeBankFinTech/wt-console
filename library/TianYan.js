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

const { width, height } = Dimensions.get("window");

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
    Dashboard.register(Console, {...this.props.options, tabLabel: '日志'}, <Console />)
    Dashboard.setup()

    this._toggleDashboard = this._toggleDashboard.bind(this)
    this.state = {
      pan: new Animated.ValueXY({
        x: width - this.size.iconSize,
        y: 300
      }),
      expendAnim: new Animated.Value(0),
      showDashboard: false
    }

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: this._onPanResponderGrant,
      onPanResponderMove: this._onPanResponderMove,
      onPanResponderRelease: this._onPanResponderRelease,
      onPanResponderTerminate: this._onPanResponderRelease
    })
  }
  componentDidMount () {
  }

  _onPanResponderGrant = (evt, gestureState) => {
    this.time = Date.parse(new Date())
    this.state.pan.setOffset({
      x: this.state.pan.x._value,
      y: this.state.pan.y._value
    })
  }

  _onPanResponderMove = (evt, gestureState) => {
    Animated.event([
      null,
      {
        dx: this.state.pan.x,
        dy: this.state.pan.y
      }
    ])(evt, gestureState)
  }
  _onPanResponderRelease = (evt, gestureState) => {
    this.state.pan.flattenOffset()

    // 处理y轴
    const y = this.state.pan.y._value
    if (y < 10 || y > height - this.size.iconSize - 10) {
      Animated.spring(this.state.pan.y, {
        toValue: y < 45 ? 45 : height - this.size.iconSize - 10,
        duration: 200
      }).start();
    }

    // 处理x轴
    let toX = 0
    if ((this.state.pan.x._value + this.size.iconSize / 2) > width / 2) {
      toX = width - this.size.iconSize
    }
    Animated.spring(this.state.pan.x, {
      toValue: gestureState.moveX > width * 0.5 ? width - this.size.iconSize : 0,
      duration: 200
    }).start();

    this.lastValueX = this.state.pan.x._value;
    this.lastValueY = this.state.pan.y._value;

    // 单击
    let releaseTime = Date.parse(new Date())
    if (
      releaseTime - this.time < 50 &&
      Math.abs(gestureState.dx) < 10 &&
      Math.abs(gestureState.dy) < 10
    ) {
      this._toggleDashboard()
    }
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
            width: this.state.expendAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [this.size.iconSize, Dimensions.get('window').width],
            }),
            height: this.state.expendAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [this.size.iconSize, Dimensions.get('window').height],
            }),
            top: this.state.expendAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [this.state.pan.getLayout().top._value, 0],
            }),
            left: this.state.expendAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [this.state.pan.getLayout().left._value, 0],
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
            <Dashboard onPressClose={() => { this._toggleDashboard() }} />
          </Animated.View> :
          <TouchableOpacity
            style={{
              borderWidth: 0,
            }}
            onPress={() => {}}>
            <Animated.Image style={{
              opacity: this.state.expendAnim.interpolate({
                inputRange: [0, 40, 100],
                outputRange: [1, 0, 0],
              }),
              backgroundColor: 'transparent',
              width: this.size.iconSize,
              height: this.size.iconSize,
            }} resizeMode={'contain'} source={require('./images/tianyan-icon.png')} />
          </TouchableOpacity>}
      </Animated.View>
    )
  }
}
