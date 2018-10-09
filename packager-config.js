/**
 * Created by erichua on 2018/10/9.
 */

const path = require('path')
const config = {
  extraNodeModules: {
    '@unpourtous/tianyan-react-native': path.resolve(__dirname, './')
  }
}
module.exports = config
