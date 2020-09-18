import axios from 'axios';
import { message } from 'antd';

// 实例化 ajax请求对象
const ajaxinstance = axios.create({
  timeout: 60000,
  headers: {
    responseType: 'json',
  },
});

// 请求拦截器
ajaxinstance.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem('token');
    const { data = {}, params = {} } = request;
    token || (window.location.href = '/user/login');
    if (!data.noloading && !params.noloading) {
      // loading.show()
      message.error('...');
    }
    token && (request.headers['Token'] = token);
    return request;
  },
  (error) => {
    // loading.hide()
    Promise.reject(error);
  },
);

// 响应拦截器
ajaxinstance.interceptors.response.use(
  (response) => {
    const { code = 1, result, msg } = response.data;
    const num = code;
    if (+code) {
      if (+code === 100104) {
        removeStore('token');
        removeStore('userInfo');
        window.location.href = '/user/login';
      } else if (num === 600008) {
        return response.data;
      } else {
        message.error(msg || '服务器繁忙！！！');
      }
    }

    return +code ? null : result || {};
  },
  (error) => {
    loading.hide();
    return Promise.reject(error);
  },
);

export default ajaxinstance;
