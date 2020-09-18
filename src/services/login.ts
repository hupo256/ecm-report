import request from '@/utils/request';

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  code: string;
}

export async function loginByUsername(data: LoginParamsType) {
  return request('/user/login', {
    method: 'POST',
    data,
  });
}

/**
 *
 * @param 获取验证码
 */
export async function getFakeCaptcha(mobile: string) {
  return request(`/user/sendMessage`, { params: { mobile } });
}
