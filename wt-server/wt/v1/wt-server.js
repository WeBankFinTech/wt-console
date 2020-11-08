const express = require('express')
const db = require('mongoose')
const logs = require('./logs')
const bodyParser = require('body-parser')
const config = require('./../../config')

const app = express()
app.use(bodyParser.json(bodyParser.json({limit: '50mb', extended: true})))

// create application/x-www-form-urlencoded，easy to get req.body
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

// connect mongodb
const dbLink = db.createConnection(`mongodb://${config.mongoUri}/wt`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

dbLink.on('open', err => {
  if (!err) {
    console.log('connect mongo success！')
  } else {
    console.log('connect mongo fail', err)
  }
})

// Interface
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

const setCORS = res => {
  if (config.allowCrossOrigin) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Content-type')
    res.header(
      'Access-Control-Allow-Methods',
      'PUT,POST,GET,DELETE,OPTIONS,PATCH'
    )
  }
  res.header('Access-Control-Max-Age', 1728000) // prefetch cache 20 days
  return res
}

// get logs
app.get('/wt/v1/logs/get', async (req, res) => {
  const ret = await logs.get(req, res, dbLink, LogSchema)
  setCORS(res)
  res.send(ret)
})

// add logs
app.post('/wt/v1/logs/add', async (req, res) => {
  const ret = await logs.add(req, res, dbLink, LogSchema)
  setCORS(res)
  res.send(ret)
})

// get all deviceIds
app.get('/wt/v1/logs/get_device_ids', async (req, res) => {
  const ret = await logs.get_device_ids(req, res, dbLink)
  setCORS(res)
  res.send(ret)
})

// get logs by id
app.get('/wt/v1/logs/get_log_by_id', async (req, res) => {
  const ret = await logs.get_log_by_id(req, res, dbLink)
  setCORS(res)
  res.send(ret)
})

app.listen(8003)
