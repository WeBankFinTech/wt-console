const getOutput = require('../constants/output')
const { DB_PREFIX } = require('../constants')

const MAX_ROW = 300
const LIMIT = 20

module.exports = (req, res, dbLink, LogSchema) => {
  return new Promise(resolve => {
    try {
      const body = req.query
      // judge device_id
      if (!body.device_id) {
        const output = getOutput()
        output.msg = 'need device_id'
        output.code = 3
        resolve(output)
        return
      }

      const LogModel = dbLink.model(`${DB_PREFIX}${body.device_id}`, LogSchema)

      const specialParams = [
        'log_content',
        'start_key',
        'limit',
        'log_start_time',
        'log_end_time',
        'device_id',
        'ascend'
      ]

      let params = {}

      // handle query
      Object.keys(req.query).forEach(key => {
        if (specialParams.indexOf(key) === -1 && req.query[key]) {
          params[key] = req.query[key]
        } else {
          const value = req.query[key]
          switch (key) {
            case 'log_content':
              // fuzzy query
              const reg = new RegExp(value, 'i')
              params[key] = { $regex: reg }
              break
            case 'log_start_time':
              params.log_time = params.log_time || {}
              params.log_time.$gte = value
              break
            case 'log_end_time':
              params.log_time = params.log_time || {}
              params.log_time.$lte = value
              break
            default:
              break
          }
        }
      })

      console.log('params', params)

      const start = Number(req.query.start_key) || 0
      console.log('req.query', req.query)
      const limit = req.query.limit
        ? req.query.limit > MAX_ROW
          ? MAX_ROW
          : Number(req.query.limit)
        : LIMIT
      console.log('limit', limit)
      
      const query = LogModel.find({
        ...params
      })
        .skip(start)
        .limit(limit)
        .sort({
          [req.query.sort || 'log_time']: req.query.ascend || 1
        })

      // execute query
      query.exec((err, logs) => {
        const output = getOutput()
        if (!err) {
          output.msg = 'get logs succeed'
          output.code = 0
          output.data = {
            logs,
            next_key: start + limit
          }
          console.log(`—— ${output.msg} ——`)
          console.log('query:', params)
          console.log('result row: ', logs.length)
          console.log(`————`)
          console.log('')
        } else {
          output.code = 2
          output.msg = `get logs fail: ${String(err)}`
        }

        resolve(output)
      })
    } catch (err) {
      const output = getOutput()
      output.msg = err
      output.code = 3
      resolve(output)
    }
  })
}
