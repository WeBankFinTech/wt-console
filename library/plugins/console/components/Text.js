import React from 'react'
import { Text } from 'react-native'

export default function SelectableText (props = {}) {
  const {
    children,
    ...restProps
  } = props
  return <Text selectable {...restProps}>{children}</Text>
}
