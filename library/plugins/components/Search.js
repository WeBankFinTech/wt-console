import React, {Component} from 'react'
import { View, TextInput } from 'react-native'
import { realOnePixel } from '../utils/DumpObject'
import Button from './Button'
import PropTypes from 'prop-types'
import {monospaceFont} from './Text'

export default class Search extends Component {
  static propTypes = {
    defaultValue: PropTypes.string,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    onEndText: PropTypes.func,
    onCleanText: PropTypes.func,
    keyboardType: PropTypes.string
  }
  static defaultProps = {
    keyboardType: 'ascii-capable'
  }
  _onClean = () => {
    this.props.onCleanText && this.props.onCleanText('')
  }
  _onChangeText = (text) => {
    this.props.onChangeText && this.props.onChangeText(text)
  }
  _onEndEditing = (event) => {
    this.props.onEndText && this.props.onEndText(event.nativeEvent.text)
  }
  render () {
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        margin: 5
      }}>
        <TextInput
          defaultValue={this.props.defaultValue}
          value={this.props.value}
          style={{
            paddingVertical: 0,
            paddingHorizontal: 5,
            height: 40,
            fontSize: 16,
            fontFamily: monospaceFont,
            borderWidth: realOnePixel,
            borderColor: 'gray',
            borderRadius: 5,
            flex: 1
          }}
          underlineColorAndroid={'transparent'}
          keyboardType={this.props.keyboardType}
          autoCorrect={false}
          iosreturnKeyType={'search'}
          placeholder={'input url segment to search, case insensitive'}
          onChangeText={this._onChangeText}
          onEndEditing={this._onEndEditing}
        />
        <Button style={{marginLeft: 5}} text={'Clean'} onPress={this._onClean} />
      </View>
    )
  }
}
