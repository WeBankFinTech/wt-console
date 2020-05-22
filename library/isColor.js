const namedColors = [
  'transparent',
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen'
]

const isHexColor = (str) => {
  const u = '[0-9a-zA-Z]'
  return [
    new RegExp(`^#${u}{3}$`),
    new RegExp(`^#${u}{4}$`),
    new RegExp(`^#${u}{6}$`),
    new RegExp(`^#${u}{8}$`),
  ].some((item) => item.test(str))
}
const isRGBColor = (str) => {
  const d = '\\s*\\d+(\\.\\d+)?\\s*'
  return [
    new RegExp(`^rgb\\(${d},${d},${d}\\)$`),
    new RegExp(`^rgba\\(${d},${d},${d},${d}\\)$`)
  ].some((item) => item.test(str))
}

const isHSLColor = (str) => {
  const d = '\\s*\\d+(\\.\\d+)?%?\\s*'
  return [
    new RegExp(`^hsl\\(${d},${d},${d}\\)$`),
    new RegExp(`^hsla\\(${d},${d},${d},${d}\\)$`)
  ].some((item) => item.test(str))
}

const isColor = (str) => {
  return namedColors.indexOf(str) > -1 ||
    isHexColor(str) || isRGBColor(str) || isHSLColor(str)
}

const parseCSSStyle = (styleStr, keys) => {
  const styles = styleStr.split(';').filter((item) => item)
  const style = {}
  styles.forEach((str) => {
    const temp = str.split(':').map((item) => item.trim())
    if (keys.indexOf(temp[0]) > -1) {
      style[temp[0]] = temp[1]
    }
  })
  return style
}

// test:
// console.log(isColor('red'))
// console.log(isColor('#0Aa'))
// console.log(isColor('#0Aab'))
// console.log(isColor('#0Aaba') === false)
// console.log(isColor('#0A8Bb0'))
// console.log(isColor('#0A8Bb09a'))
// console.log(isColor('rgb(23, 56, 90)'))
// console.log(isColor('rgba(25, 90, 12, 0.5)'))
// console.log(isColor('hsl(360, 100%, 100%)'))
// console.log(isColor('hsla(360, 100%, 100%, 1.0)'))

export {isColor, parseCSSStyle}
