const express = require('express')
const db = require('mongoose')
const logs = require('./logs')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json(bodyParser.json({limit: '50mb', extended: true})))

// 创建 application/x-www-form-urlencoded 编码解析，方便拿到req.body对象
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

// 连数据库
const dbLink = db.createConnection('mongodb://localhost:27017/wt', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

dbLink.on('open', err => {
  if (!err) {
    console.log('数据库连接成功！')
  } else {
    console.log('数据库连接失败', err)
  }
})

// 定义Interface
const LogSchema = new db.Schema({
  app_id: String,
  user_id: String,
  session_id: String,
  log_time: {
    type: Date,
    default: Date.now
  },
  log_type: String,
  log_content: String,
  log_format: String
})

// 绑定Model
// const LogsModel = dbLink.model('logsv1', LogSchema)

const setCORS = res => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-type')
  res.header(
    'Access-Control-Allow-Methods',
    'PUT,POST,GET,DELETE,OPTIONS,PATCH'
  )
  res.header('Access-Control-Max-Age', 1728000) //预请求缓存20天
  return res
}

// 查询logs
app.get('/wt/v1/logs/get', async (req, res) => {
  const ret = await logs.get(req, res, dbLink, LogSchema)
  setCORS(res)
  res.send(ret)
})

// 新增logs
app.post('/wt/v1/logs/add', async (req, res) => {
  const ret = await logs.add(req, res, dbLink, LogSchema)
  setCORS(res)
  res.send(ret)
})

// 查询设备id
app.get('/wt/v1/logs/get_device_ids', async (req, res) => {
  const ret = await logs.get_device_ids(req, res, dbLink)
  setCORS(res)
  res.send(ret)
})

// 根据id查询日志
app.get('/wt/v1/logs/get_log_by_id', async (req, res) => {
  const ret = await logs.get_log_by_id(req, res, dbLink)
  setCORS(res)
  res.send(ret)
})

app.listen(8003)
