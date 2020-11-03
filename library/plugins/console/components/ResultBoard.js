/**
 * Created by erichua on 26/05/2017.
 */

import {
  Image,
  Text,
  View,
  TouchableHighlight
} from 'react-native'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Loading extends Component {
  static propTypes = {
    visibility: PropTypes.bool,
    logId: PropTypes.number,
    logServerUrl: PropTypes.string,
    status: PropTypes.string,
    onPressBack: PropTypes.func
  }

  render () {
    const { status = 'success' } = this.props
    if (!this.props.visibility) {
      return null
    }
    return (
      <View style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#EEEEEE'
      }}>
        <Image
          style={{marginTop: 100}}
          source={status === 'success' ? require('../images/icon_success.png') : require('../images/icon_fail.png')} />
        <View style={{
          marginTop: 10,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 5,
          paddingBottom: 5,
          backgroundColor: '#00FF8811'
        }}>
          <Text
            style={{
              fontSize: 36,
              color: status === 'success' ? 'green' : 'red'
            }}>{status}!</Text>
        </View>
        {status === 'success' ? <View>
          {this.props.logServerUrl ? <Text style={{marginTop: 10}}>Logs is uploading to {this.props.logServerUrl}</Text> : null}
          <Text style={{marginTop: 10}}>You can check log detail in browser</Text>
          <Text style={{marginTop: 10}}>Select your device_id: {this.props.deviceId}</Text>
        </View> : <View>
          <Text style={{marginTop: 10}}>submit logs to server fail...</Text>
        </View>
        }

        <TouchableHighlight onPress={this.props.onPressBack}>
          <Text style={{marginTop: 10, fontSize: 18, color: '#00AA0088'}}>Back To Console </Text>
        </TouchableHighlight>
      </View>
    )
  }
}
