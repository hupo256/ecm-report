// 环境
let env = IS_ENV === 'production' || IS_ENV === 'pre' ? '' : IS_ENV
// 接口host
const baseHost = `//${env}cmsapi.dnatime.com/`
// const host = baseHost

// const host = 'https://devcmsapi.dnatime.com'

// const host = 'http://10.88.27.7:8091/'
// const host = 'http://devcmsapi.dnatime.com'
// 陈凯
// const host = 'http://testcmsapi.dnatime.com/'
const host = 'https://test03cmsapi.dnatime.com/'
// const host = 'http://10.88.27.183:8091'
// 李顶
// const host = 'http://192.168.1.141:8091'
// 刘宁
// const host = 'http://10.88.27.108:8091'
// 建军
// const host = 'http://192.168.1.190:8091'
// 王世杰
// const host = 'http://192.168.1.111:8091'
// 海平
// const host = 'http://192.168.1.124:8091'
// 余
// const host = 'http://192.168.1.116:8091'
// 王志凯
// const host = 'http://10.88.27.73:8091/'
// 熊全
// const host = 'http://192.168.3.23:8091'
// alex
// const host = 'http://192.168.3.158:8091/'
// 田海波
// const host = 'http://10.88.27.30:8091/'
// const host = 'http://192.168.3.158:8091/'

// const host = 'http://192.168.3.206:8091'
// const host = 'http://10.88.27.243:8091'
// const host = 'http://10.88.27.87:8091'

// const host='http://10.88.27.119:8091'
// const host = 'http://10.88.27.34:8091'
// const host = 'http://10.88.27.38:8091/' // 高闯
// const host = 'http://10.88.27.2:8091/'
//const host = "http://10.88.27.248:8091" //王世杰

// sso url
const ssoUrl = `${env}ecm.dnatime.com/#/login`

export default {
  baseHost,
  host,
  ssoUrl,
}
