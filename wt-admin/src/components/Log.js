import { ParseService } from './../services'

class Log extends Component {
  static propTypes = {
    logType: PropTypes.string,
    value: PropTypes.any,
    timestamp: PropTypes.number
  }
  constructor (props) {
    super(props)
    this.state = {
      show: false
    }
  }
  _onToggle = () => {
    this.setState({
      show: !this.state.show
    })
  }
  // componentDidCatch (error) {
  //   // Console.rawConsole.log(error)
  // }
  _getColor () {
    const { logType } = this.props
    if (logType === 'warn') {
      return 'rgb(94, 61, 12)'
    } else if (logType === 'error') {
      return 'rgb(255, 6, 27)'
    }
  }
  _getBgColor () {
    const { logType } = this.props
    if (logType === 'warn') {
      return 'rgb(255, 251, 231)'
    } else if (logType === 'error') {
      return 'rgb(255, 240, 240)'
    }
  }
  render () {
    const { value, timestamp } = this.props
    const { show } = this.state
    const str = this.logToString(value, timestamp)
    const color = this._getColor()
    const bgColor = color ? this._getBgColor() : undefined
    return (
      <View style={[{ backgroundColor: bgColor }, this.props.style]}>
        <Arrow
          color={color}
          show={show}
          str={str}
          log={ParseService.logsToString(value).join(' ')}
          onPress={this._onToggle}
        />
        {show ? (
          <Card>
            {value.map((item, index) => (
              <Item style={{ marginTop: 5 }} key={index} value={item} />
            ))}
          </Card>
        ) : null}
      </View>
    )
  }
  logToString = (tags, timestamp) => {
    const eles = []
    if (timestamp !== undefined) {
      const t = new Date(timestamp)
      eles.push(
        <span
          key={timestamp}
          style={{
            fontSize: 12,
            lineHeight: 18,
            color: 'gray',
            fontWeight: 'normal'
          }}
        >
          {t.getHours()}:{t.getMinutes()}:{t.getSeconds()}.{String(t.getMilliseconds()).padStart(3, '0')}{' '}
        </span>
      )
    }
    // Console.rawConsole.log('tags', tags, tags.length)
    for (let i = 0; i < tags.length; i += 1) {
      let tag = String(tags[i])
      let t = tag.split('%c')
      // Console.rawConsole.log('tag', t)
      if (t.length > 1) {
        eles.push(
          <span
            style={{
              fontSize: 12,
              lineHeight: 18
            }}
            key={i}
          >
            {t[0]}{' '}
          </span>
        )
        for (let j = 1; j < t.length; j += 1) {
          const style = ColorService.parseCSSStyle(tags[i + j], ['color'])
          let color
          if (style.color) {
            color = style.color
          }
          // Console.rawConsole.log('color', t2)
          eles.push(
            <span
              key={i + '_' + j}
              style={{
                fontSize: 12,
                lineHeight: 18,
                color: color
              }}
            >
              {t[j]}
            </span>
          )
        }
        i += t.length - 1
      } else {
        eles.push(<span key={i}>{t[0]} </span>)
      }
    }
    return <span key={`${timestamp}1`}>{eles}</span>
  }
}
