import React from 'react'
import { Platform, Text } from 'react-native'

const monospaceFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace'
})
function MonospaceText (props = {}) {
  const {
    children,
    style,
    ...resetProps
  } = props
  return <Text
    style={[
      {
        fontFamily: monospaceFont,
      },
      style
    ]}
    {...resetProps}>{children}</Text>
}

export default function SelectableText (props = {}) {
  const {
    children,
    ...restProps
  } = props
  return <MonospaceText selectable {...restProps}>{children}</MonospaceText>
}


export {
  MonospaceText
}
