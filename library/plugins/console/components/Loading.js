/**
 * Created by erichua on 26/05/2017.
 */

import {
  ActivityIndicator,
  View
} from 'react-native'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Loading extends Component {
  static propTypes = {
    visibility: PropTypes.bool
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EEEEEEDD'
      }}>
        <ActivityIndicator
          animating={true}
          style={[{height: 80}]}
          size="large"/>
      </View>
    )
  }
}
