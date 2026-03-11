import request from '../utils/request'

// 获取订单列表
export const getOrders = (params) => {
  return request.get('/orders', { params })
}

// 获取订单详情
export const getOrder = (id) => {
  return request.get(`/orders/${id}`)
}

// 更新订单状态
export const updateOrderStatus = (id, status) => {
  return request.patch(`/orders/${id}/status`, { status })
}

// 订单发货
export const deliverOrder = (id, data) => {
  return request.post(`/orders/${id}/delivery`, data)
}
