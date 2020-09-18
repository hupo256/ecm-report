import { stringify } from 'querystring';
import { history, Reducer, Effect } from 'umi';
import { message } from 'antd';
import { loginByUsername } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';

export interface StateType {
  status?: boolean;
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    logout: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      try {
        const response = yield call(loginByUsername, payload);
        console.log('response', response);
        if (response.code === 0) {
          message.success('登录成功');
          //设置权限
          setAuthority('admin');

          //记录登录信息
          localStorage.setItem('currentUser', JSON.stringify(response.result));

          //token设置
          localStorage.setItem('token', response.result.token);

          const urlParams = new URL(window.location.href);
          const params = getPageQuery();
          let { redirect } = params as { redirect: string };
          if (redirect) {
            const redirectUrlParams = new URL(redirect);
            if (redirectUrlParams.origin === urlParams.origin) {
              redirect = redirect.substr(urlParams.origin.length);
              if (redirect.match(/^\/.*#/)) {
                redirect = redirect.substr(redirect.indexOf('#') + 1);
              }
            } else {
              window.location.href = redirect;
              return;
            }
          }

          yield put({
            type: 'changeLoginStatus',
            status: response.code === 200,
          });

          //默认跳转到 问题列表
          history.replace(redirect || '/');
        }
      } catch (err) {
        console.log(err);
      }
    },

    logout() {
      const { redirect } = getPageQuery();
      // Note: There may be security issues, please note

      //权限 删除
      localStorage.removeItem('authority');
      //用户信息 删除
      localStorage.removeItem('currentUser');
      //token
      localStorage.removeItem('token');

      if (window.location.pathname !== '/user/login' && !redirect) {
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { status }) {
      return {
        ...state,
        status,
      };
    },
  },
};

export default Model;
