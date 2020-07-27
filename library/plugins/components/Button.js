import React from 'react'
import { Text } from 'react-native'
import { TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'

export default class Button extends React.Component {
  static propTypes = {
    onPress: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    style: PropTypes.any
  }
  static defaultProps = {
    fontColor: 'crimson'
  }
  onPress = () => {
    const {
      disabled
    } = this.props
    if (disabled) {
      return
    }
    this.props.onPress()
  }
  render () {
    const {
      disabled
    } = this.props
    return (
      <TouchableOpacity
        onPress={this.onPress}
        activeOpacity={0.5}
        style={[{
          justifyContent: 'center',
          paddingVertical: 10,
          paddingHorizontal: 15,
          backgroundColor: '#DDDDDD',
          borderRadius: 5,
          opacity: disabled ? 0.5 : 1
        }, this.props.style]}
      >
        <Text style={{fontSize: 16, fontWeight: 'bold', color: 'crimson'}}>{this.props.text}</Text>
      </TouchableOpacity>
    )
  }
}
