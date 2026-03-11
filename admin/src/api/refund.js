import request from '../utils/request'

// 获取退款列表
export const getRefunds = (params) => {
  return request.get('/refund', { params })
}

// 获取退款详情
export const getRefund = (id) => {
  return request.get(`/refund/${id}`)
}

// 审核退款
export const reviewRefund = (id, data) => {
  return request.post(`/refund/${id}/review`, data)
}
