import request from '../utils/request'

// 获取分类列表
export const getCategories = (params) => {
  return request.get('/categories', { params })
}

// 获取分类详情
export const getCategory = (id) => {
  return request.get(`/categories/${id}`)
}

// 更新分类
export const updateCategory = (id, data) => {
  return request.put(`/categories/${id}`, data)
}
