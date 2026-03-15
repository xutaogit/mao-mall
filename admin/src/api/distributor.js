import request from '../utils/request'

// 获取分销员申请列表
export const getApplications = (params) => {
  return request.get('/admin/distributor/applications', { params })
}

// 审核分销员申请
export const reviewApplication = (id, data) => {
  return request.post(`/admin/distributor/applications/${id}/review`, data)
}

// 获取分销员列表
export const getDistributors = (params) => {
  return request.get('/admin/distributor/distributors', { params })
}

// 获取商品佣金配置列表
export const getCommissions = (params) => {
  return request.get('/admin/distributor/commissions', { params })
}

// 设置单个商品佣金
export const setCommission = (data) => {
  return request.post('/admin/distributor/commissions', data)
}

// 批量设置商品佣金
export const batchSetCommission = (data) => {
  return request.post('/admin/distributor/commissions/batch', data)
}

// 删除佣金配置
export const deleteCommission = (id) => {
  return request.delete(`/admin/distributor/commissions/${id}`)
}

// 获取分销订单列表
export const getDistributionOrders = (params) => {
  return request.get('/admin/distributor/orders', { params })
}

// 获取佣金统计
export const getStatistics = (params) => {
  return request.get('/admin/distributor/statistics', { params })
}

