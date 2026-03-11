import request from '../utils/request'

// 创建订单
export const createOrder = (data) => {
  return request.post('/orders/create', data)
}

// 获取订单列表
export const getOrders = (params) => {
  return request.get('/orders', { params })
}

// 获取订单详情
export const getOrder = (id) => {
  return request.get(`/orders/${id}`)
}

// 订单支付
export const payOrder = (id) => {
  return request.post(`/orders/${id}/pay`)
}

// 取消订单
export const cancelOrder = (id) => {
  return request.post(`/orders/${id}/cancel`)
}

// 确认收货
export const confirmOrder = (id) => {
  return request.post(`/orders/${id}/confirm`)
}
