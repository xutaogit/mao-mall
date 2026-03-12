import request from '../utils/request'

// 创建支付单据
export const createPayment = (data) => {
  return request.post('/payment/create', data)
}

// 获取支付单据详情
export const getPaymentDetail = (paymentSn) => {
  return request.get(`/payment/${paymentSn}`)
}

// 查询支付状态
export const getPaymentStatus = (paymentSn) => {
  return request.get(`/payment/${paymentSn}/status`)
}

// 模拟支付（开发测试用）
export const mockPay = (paymentSn) => {
  return request.post(`/payment/${paymentSn}/mock-pay`)
}

// 获取订单的支付单据
export const getOrderPayment = (orderId) => {
  return request.get(`/payment/order/${orderId}`)
}
