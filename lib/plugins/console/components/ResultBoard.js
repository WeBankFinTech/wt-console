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

export default class Loading extends Component {
  static propTypes = {
    visibility: React.PropTypes.bool,
    logId: React.PropTypes.string,
    logServerUrl: React.PropTypes.string,

    onPressBack: React.PropTypes.func
  }

  render () {
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
          source={require('../images/icon_success.png')}/>
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
              color: 'green',
            }}>{this.props.logId}</Text>
        </View>
        {this.props.logServerUrl ? <Text style={{marginTop: 10}}>Log has been uploaded to {this.props.logServerUrl}</Text> : null}
        <Text style={{marginTop: 10}}>You can get log detail in your browser</Text>

        <TouchableHighlight onPress={this.props.onPressBack}>
          <Text style={{marginTop: 10, fontSize: 18, color: '#00AA0088'}}>Back To Console </Text>
        </TouchableHighlight>

      </View>
    )
  }
}
