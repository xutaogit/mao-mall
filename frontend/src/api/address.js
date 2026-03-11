import request from '../utils/request'

// 获取地址列表
export const getAddresses = () => {
  return request.get('/addresses')
}

// 获取地址详情
export const getAddress = (id) => {
  return request.get(`/addresses/${id}`)
}

// 添加地址
export const addAddress = (data) => {
  return request.post('/addresses', data)
}

// 更新地址
export const updateAddress = (id, data) => {
  return request.put(`/addresses/${id}`, data)
}

// 删除地址
export const deleteAddress = (id) => {
  return request.delete(`/addresses/${id}`)
}

// 设置默认地址
export const setDefaultAddress = (id) => {
  return request.patch(`/addresses/${id}/default`)
}
