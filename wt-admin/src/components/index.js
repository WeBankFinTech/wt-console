const components = {
  get Group () {
    return require('./Group').default
  },
  get Log () {
    return require('./Log').default
  }
}

module.exports = components
