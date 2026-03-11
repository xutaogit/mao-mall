import request from '../utils/request'

// 获取优惠券列表
export const getCoupons = (params) => {
  return request.get('/coupon', { params })
}

// 获取优惠券详情
export const getCoupon = (id) => {
  return request.get(`/coupon/${id}`)
}

// 创建优惠券
export const createCoupon = (data) => {
  return request.post('/coupon', data)
}

// 更新优惠券
export const updateCoupon = (id, data) => {
  return request.put(`/coupon/${id}`, data)
}

// 删除优惠券
export const deleteCoupon = (id) => {
  return request.delete(`/coupon/${id}`)
}
