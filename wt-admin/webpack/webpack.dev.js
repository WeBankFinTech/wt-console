const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const REGIONS = {
  DEV: '',
  ST: '',
  UAT: '',
  LOCAL: 'http://localhost:9900'
};

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: {
      index: '/index.html'
    },
    hot: true,
    open: true,
    port: 9900,
    proxy: {
      '/api': {
        target: REGIONS.DEV,
        changeOrigin: true
      }
    }
  }
});
