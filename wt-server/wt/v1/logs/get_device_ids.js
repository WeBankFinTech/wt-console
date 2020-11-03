const getOutput = require('../constants/output')
const { DB_PREFIX } = require('../constants')
const _ = require('lodash')

module.exports = (req, res, dbLink) => {
  return new Promise(resolve => {
    try {
      const body = req.query
      const output = getOutput()

      // 掏出数据库wt下的所有collection
      let collectNames = []
      dbLink.db.collections().then(collects => {
        for (let c of collects) {
          const _namespace = _.get(c, 's.namespace')
          const namespace = JSON.parse(JSON.stringify(_namespace))
          collectNames.push(namespace.collection)
        }
        const deviceIds = collectNames
          .filter(item => item.includes(DB_PREFIX))
          .map(item => item.replace(DB_PREFIX, ''))
        console.log('device_ids', deviceIds)
        output.data = {
          device_ids: deviceIds
        }
        resolve(output)
      })
    } catch (err) {
      const output = getOutput()
      console.log(err)
      output.msg = err
      output.code = 3
      resolve(output)
    }
  })
}
