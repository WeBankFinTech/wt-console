# WTConsole——React Native应用内日志工具

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

注：从[WeTrident项目](https://gitee.com/WeBank/WeTrident)提炼而来。

## 背景

App开发过程中，经常会遇到一个场景就是，测试说我遇到一个xxx问题，但是不能复现，之前比较多的解决方案是基于文件日志。我们自己使用过程中发现文件日志太重，而且测试同学取日志的学习成本太高。于是在web项目中开始使用类似vConsole这一类的工具，又因为我们主要使用到的日志查看和日志上传功能。因此我们在React Native实现了类似vConsole的功能，同时在陆续扩展一些功能。

## 特性

1. 通过简单的接入即可在App内查看日志。
2. 结合 [WTConsoleServer](https://gitee.com/UnPourTous/wt-console-server) 可以很方便的实现日志上传功能。

# 基本用法

将`TianYan`嵌入到App最外层View中，具体用法可以参考`exmaple`目录
``` jsx
export default class SimpleApp extends Component {
  render () {
    return (
      <View style={styles.container}>
        {/* other view */}
        <TianYan options={{
          logServerUrl: 'http://23lab.com:3000/v1/log',
          maxLogLine: 1000,
          ignoreFilter: function () { // 根据自定义规则过滤日志，避免手机端显示太多无用信息
            return (arguments && typeof arguments[0] === 'string' && arguments[0].indexOf('ignored log') === 0)
          }
        }} />
      </View>
    )
  }
}
```

