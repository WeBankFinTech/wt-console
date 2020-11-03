// 默认输出格式
module.exports = () => ({
  code: 0, // 0->成功, 其他数字->失败
  data: null,
  msg: '' // 成功及失败都应返回相应含义
})
