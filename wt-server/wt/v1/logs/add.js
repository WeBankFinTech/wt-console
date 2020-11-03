const getOutput = require('../constants/output')

module.exports = (req, res, dbLink, LogSchema) => {
  return new Promise((resolve, reject) => {
    // device_id判断
    const body = req.body
    if (!body.device_id) {
      const output = getOutput()
      output.msg = '缺少参数device_id'
      output.code = 3
      console.log('output', output)
      resolve(output)
      return
    }

    const LogModel = dbLink.model(`wt-logs-${body.device_id}`, LogSchema)

    // 存入失败处理
    let errs = []
    const fnSaveErr = err => {
      errs.push(err)
    }

    // 遍历并储存对象
    body.log_list.forEach(item => {
      let Log = new LogModel()

      Log.app_id = body.app_id
      Log.user_id = body.user_id
      Log.session_id = body.session_id

      Object.keys(item).forEach(key => {
        if (key !== 'log_time') {
          Log[key] = item[key]
        }
      })
      console.log('Log', Log)
      Log.save(fnSaveErr)
    })

    const output = getOutput()
    // 日志记录
    if (!errs.length) {
      output.msg = 'Add logs succeed!'
      output.code = 0
      console.log('')
      console.log(`—— ${output.msg} ——`)
      console.log(`app_id: ${body.app_id}`)
      console.log(`user_id: ${body.user_id}`)
      console.log(`session_id: ${body.session_id}`)
      console.log(`row num: ${body.log_list.length}`)
      console.log(`————`)
      console.log('')
    } else {
      output.msg = 'Add logs fail'
      output.code = 1
      console.log(`—— ${output.msg} ——`)
      errs.forEach(item => console.log(item))
      console.log(`————`)
      console.log('')
    }

    // 返回数据
    output.data = null
    resolve(output)
  })
}
