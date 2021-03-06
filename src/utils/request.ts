import { extend } from 'umi-request';
import { notification } from 'antd';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
  const { response } = error;
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  } else if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  return response;
};

/**
 * 配置request请求时的默认参数
 */

const request = extend({
  errorHandler, // 网络错误处理
  credentials: 'include', // 默认请求是否带上cookie
  prefix: '/api',
  headers: {
    responseType: 'json',
    platform: 'ecm-report',
  },
});

/**
 * 请求 拦截
 */

request.interceptors.request.use((url, options) => {
  const token = localStorage.getItem('token');

  if (token) {
    options.headers['Token'] = token;
  }

  return {
    url,
    options,
  };
});

/**
 * 包一层 处理返回
 */

const requestUmi = async (url: string, params: { method: 'GET' }): Promise<any> =>
  await request(url, params).then(hasResponseError);

// 检测返回结果是否有错误
function hasResponseError(response: Promise<any>): Promise<any> {
  if (response.code !== 0) {
    const message = response.msg || '请求异常';

    notification.error({
      message,
      description: '',
    });

    return Promise.reject(message);
  }
  return response;
}

export default requestUmi;

// import axios from 'axios';
// import { message } from 'antd';

// // 实例化 ajax请求对象
// const request = axios.create({
//   // baseURL: 'https://test03cmsapi.dnatime.com',
//   timeout: 60000,
//   headers: {
//     responseType: 'json',
//     token: localStorage.getItem('token'),
//   },
// });

// // // 请求拦截器
// request.interceptors.request.use(
//   (req) => {
//     // const token = localStorage.getItem('token');
//     // const { data = {}, params = {} } = req;
//     // // token || (window.location.href = '/user/login');
//     // if (!data.noloading && !params.noloading) {
//     //   // loading.show()
//     //   //message.error('...');
//     // }

//     return req;
//   },
//   (error) => {
//     // loading.hide()
//     Promise.reject(error);
//   },
// );

// // 响应拦截器
// request.interceptors.response.use(
//   (response) => {
//     const { code = 1, result, msg } = response.data;
//     const num = code;
//     if (+code) {
//       if (+code === 100104) {
//         // window.location.href = '/user/login';
//       } else if (num === 600008) {
//         return response.data;
//       } else {
//         message.error(msg || '服务器繁忙！！！');
//       }
//     }

//     return +code ? null : response.data || {};
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// export default request;
