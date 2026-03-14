import request from '../utils/request'

// 提交分销申请
export const applyDistributor = (data) => {
  return request.post('/distributor/apply', data)
}

// 获取分销员信息
export const getDistributorInfo = () => {
  return request.get('/distributor/info')
}

// 获取分销中心数据
export const getDistributorCenter = () => {
  return request.get('/distributor/center')
}

// 获取佣金明细
export const getDistributorOrders = (params) => {
  return request.get('/distributor/orders', { params })
}

// 绑定分销关系
export const bindDistributor = (data) => {
  return request.post('/distributor/bind', data)
}
