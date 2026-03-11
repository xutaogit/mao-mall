import request from '../utils/request'

// 获取优惠券列表
export const getCoupons = (params) => {
  return request.get('/coupon', { params })
}

// 获取优惠券详情
export const getCoupon = (id) => {
  return request.get(`/coupon/${id}`)
}

// 领取优惠券
export const claimCoupon = (id) => {
  return request.post(`/coupon/${id}/claim`)
}

// 我的优惠券
export const getMyCoupons = (params) => {
  return request.get('/coupon/my/list', { params })
}

// 使用优惠券
export const useCoupon = (data) => {
  return request.post('/coupon/use', data)
}
