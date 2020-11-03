const getOutput = require('../constants/output')
const { DB_PREFIX } = require('../constants')

const MAX_ROW = 300
const LIMIT = 20

module.exports = (req, res, dbLink, LogSchema) => {
  return new Promise(resolve => {
    try {
      // device_id判断
      const body = req.query
      if (!body.device_id) {
        const output = getOutput()
        output.msg = '缺少参数device_id'
        output.code = 3
        resolve(output)
        return
      }

      const LogModel = dbLink.model(`${DB_PREFIX}${body.device_id}`, LogSchema)

      // 列出需要特殊处理的参数
      const specialParams = [
        'log_content',
        'start_key',
        'limit',
        'log_start_time',
        'log_end_time',
        'device_id',
        'ascend'
      ]

      // 参数过滤，生成query
      let params = {}

      // 查询条件处理
      Object.keys(req.query).forEach(key => {
        if (specialParams.indexOf(key) === -1 && req.query[key]) {
          // 常规参数，取值全等
          params[key] = req.query[key]
        } else {
          const value = req.query[key]
          switch (key) {
            case 'log_content':
              // 模糊查询ok
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

      // 翻页
      const start = Number(req.query.start_key) || 0
      console.log('req.query', req.query)
      const limit = req.query.limit
        ? req.query.limit > MAX_ROW
          ? MAX_ROW
          : Number(req.query.limit)
        : LIMIT
      console.log('limit', limit)
      // let log_time = {}

      // // 时间段限制
      // if (req.query.log_start_time) {
      //   log_time.$gte = req.query.log_start_time
      // }

      // if (req.query.log_end_time) {
      //   log_time.$lte = req.query.log_end_time
      // }

      // 生成查询条件：query
      const query = LogModel.find({
        ...params
        // log_content: {$regex: 'pattern'}  // 模糊匹配
        // log_time
      })
        .skip(start) // 起始行
        .limit(limit) // 取数位置
        .sort({
          // 排序：默认按log时间顺序
          [req.query.sort || 'log_time']: req.query.ascend || 1
        })

      // 执行查询
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
