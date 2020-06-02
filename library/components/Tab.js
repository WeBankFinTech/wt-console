import React, {Component} from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PixelRatio
} from 'react-native'
import PropTypes from 'prop-types'
const realOnePixel = 1 / PixelRatio.get()

export default class Tab extends Component {
  static propTypes = {
    pages: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      renderContent: PropTypes.func.isRequired
    })),
    initPage: PropTypes.number,
    style: PropTypes.any,
    onChangePage: PropTypes.func
  }
  static defaultProps = {
    pages: [],
    initPage: 0
  }

  constructor (props) {
    super(props)
    this.state = {
      showIndex: props.initPage
    }
  }

  _onChangePage (index) {
    this.setState({
      showIndex: index
    })
    this.props.onChangePage && this.props.onChangePage(index)
  }

  _renderButton (item, index) {
    const {
      showIndex
    } = this.state
    const isShow = showIndex === index
    return (
      <TouchableOpacity
        key={index}
        activeOpacity={0.5}
        onPress={() => this._onChangePage(index)}
        style={[
          styles.button,
          index > 0 ? styles.borderLeft : null
        ]}
      >
        <Text style={[styles.text, isShow ? styles.textActive : null]}>{item.title}</Text>
      </TouchableOpacity>
    )
  }

  render () {
    const {
      pages,
      style
    } = this.props
    const {
      showIndex
    } = this.state

    return (
      <View style={style}>
        <View style={styles.header}>
          {pages.map((item, index) => this._renderButton(item, index))}
        </View>
        {pages[showIndex]
          ? pages[showIndex] && pages[showIndex].renderContent()
          : <Text>no renderContent for page-{showIndex}</Text>}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    height: 40,
    flexDirection: 'row',
    borderBottomWidth: realOnePixel,
    borderBottomColor: 'gray'
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    color: 'gray'
  },
  textActive: {
    color: 'black'
  },
  borderLeft: {
    borderLeftWidth: realOnePixel,
    borderLeftColor: 'gray'
  }
})
