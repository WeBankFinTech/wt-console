# React Native应用内日志工具
[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
## 背景
App开发过程中，经常会遇到一个场景就是，测试说我遇到一个xxx问题，但是不能复现，之前比较多的解决方案是基于文件日志。我们自己使用过程中发现文件日志太重，而且测试同学取日志的学习成本太高。于是在web项目中开始使用类似vConsole这一类的工具，又因为我们主要使用到的日志查看和日志上传功能，所以当前的tianyan-react-native 版本只提供这两个核心功能。 

## 特性
1. 通过简单的接入即可在App内查看日志。
2. 结合 [tianyan-server](https://github.com/UnPourTous/tianyan-server) 可以很方便的实现日志上传功能。

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
          maxLogLine: 1000
        }} />
      </View>
    )
  }
}
```

## 实现效果

![image](https://user-images.githubusercontent.com/1309744/28671050-d65857e2-730d-11e7-8ada-1eba740956ea.png)
![image](https://user-images.githubusercontent.com/1309744/28671072-ee5c40c4-730d-11e7-9713-68feba36d734.png)
![image](https://user-images.githubusercontent.com/1309744/28671081-f43b0c32-730d-11e7-9da9-08e6e8623520.png)
