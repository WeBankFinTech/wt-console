import React, {Component} from 'react'
import {
  View,
  Text,
  PixelRatio,
  TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'

export default class ButtonGroup extends Component {
  static propTypes = {
    list: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      onPress: PropTypes.func.isRequired
    }))
  }
  render () {
    return (
      <View
        style={{
          height: 45,
          alignSelf: 'stretch',
          borderTopWidth: 1 / PixelRatio.get(),
          borderColor: '#BBC',
          flexDirection: 'row'
        }}>
        {this.props.list.map((item, index) => {
          const eles = []
          if (index > 0) {
            eles.push(
              <View
                key={item.name + '_bar'}
                style={{
                  width: 0,
                  borderRightWidth: 1 / PixelRatio.get(),
                  borderColor: '#BBC'
                }} />
            )
          }
          eles.push(
            <TouchableOpacity
              key={item.name}
              onPress={item.onPress}
              underlayColor={'#EEE'}
              style={{
                flex: 1
              }}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderColor: '#BBC',
                  flex: 1
                }}>
                <Text style={{
                  color: '#414951'
                }}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )
          return eles
        })}
      </View>
    )
  }
}
