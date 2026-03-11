import request from '../utils/request'

// 获取退款列表
export const getRefunds = (params) => {
  return request.get('/refund', { params })
}

// 获取退款详情
export const getRefund = (id) => {
  return request.get(`/refund/${id}`)
}

// 申请退款
export const applyRefund = (data) => {
  return request.post('/refund/apply', data)
}
