import request from '../utils/request'

// 用户注册
export const register = (data) => {
  return request.post('/auth/register', data)
}

// 用户登录
export const login = (data) => {
  return request.post('/auth/login', data)
}

// 获取用户信息
export const getUserInfo = () => {
  return request.get('/auth/profile')
}

// 更新用户信息
export const updateUserInfo = (data) => {
  return request.put('/auth/profile', data)
}

// 修改密码
export const changePassword = (data) => {
  return request.post('/auth/change-password', data)
}

// 退出登录
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
}
