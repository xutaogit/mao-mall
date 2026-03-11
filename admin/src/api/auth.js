import request from '../utils/request'

// 管理员登录
export const login = (data) => {
  return request.post('/auth/admin/login', data)
}

// 获取管理员信息
export const getAdminInfo = () => {
  return request.get('/auth/admin/info')
}

// 退出登录
export const logout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
}
