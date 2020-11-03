import { ParseService } from './../services'
import { Log, Card } from './../components'

class Group extends Component {
  static propTypes = {
    tag: PropTypes.any,
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
  _toString (tag, list) {
    return `\
group: ${ParseService.logsToString(tag).join(' ')}
==========
${list
  .map(item => {
    return `${ParseService.logsToString(item.msg).join(' ')}`
  })
  .join('\n==========\n')}`
  }
  render () {
    const { value, tag, timestamp } = this.props
    const { show } = this.state
    const str = this.logToString(tag, timestamp)
    return (
      <View>
        <Arrow isGroup show={show} str={str} log={this._toString(tag, value)} onPress={this._onToggle} />
        {show ? (
          <Card>
            {value.map((item, index) => (
              <Log
                key={index}
                style={{ marginTop: 5, borderTopWidth: 1, borderTopColor: '#AAAAAA' }}
                value={item.msg}
                logType={item.logType}
                timestamp={item.timestamp}
              />
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

export default Group
