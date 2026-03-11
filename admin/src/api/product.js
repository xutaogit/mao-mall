import request from '../utils/request'

// 获取商品列表
export const getProducts = (params) => {
  return request.get('/products', { params })
}

// 获取商品详情
export const getProduct = (id) => {
  return request.get(`/products/${id}`)
}

// 创建商品
export const createProduct = (data) => {
  return request.post('/products', data)
}

// 更新商品
export const updateProduct = (id, data) => {
  return request.put(`/products/${id}`, data)
}

// 删除商品
export const deleteProduct = (id) => {
  return request.delete(`/products/${id}`)
}

// 更新上架状态
export const updatePublishStatus = (id, publishStatus) => {
  return request.patch(`/products/${id}/publish`, { publishStatus })
}

// 更新推荐状态
export const updateRecommendStatus = (id, recommendStatus) => {
  return request.patch(`/products/${id}/recommend`, { recommendStatus })
}
