class Arrow extends Component {
  render () {
    const { show, str, log } = this.props
    return (
      <View style={{ flexDirection: 'row', marginVertical: 5 }}>
        <TouchableOpacity onPress={this.props.onPress} activeOpacity={0.5} style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={[styles.text, { marginRight: 5 }]}>{show ? '👇' : '👉️'}</Text>
            <Text
              style={[
                styles.text,
                { flex: 1, color: this.props.color },
                this.props.isGroup ? { fontWeight: 'bold' } : null
              ]}
              numberOfLines={show && this.props.isGroup ? undefined : 1}
            >
              {str}
            </Text>
          </View>
        </TouchableOpacity>
        {show ? <Copy log={log} /> : null}
      </View>
    )
  }
}
