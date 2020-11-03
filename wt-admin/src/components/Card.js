class Card extends Component {
  render () {
    return (
      <View
        style={[
          {
            marginLeft: 10,
            paddingLeft: 5,
            borderLeftWidth: 1,
            borderLeftColor: '#AAAAAA'
          },
          this.props.style
        ]}
      >
        {this.props.children}
      </View>
    )
  }
}
