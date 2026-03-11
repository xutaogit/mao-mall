import request from '../utils/request'

// 获取购物车列表
export const getCart = () => {
  return request.get('/cart')
}

// 添加到购物车
export const addToCart = (data) => {
  return request.post('/cart', data)
}

// 更新购物车商品数量
export const updateCartItem = (id, data) => {
  return request.put(`/cart/${id}`, data)
}

// 删除购物车商品
export const deleteCartItem = (id) => {
  return request.delete(`/cart/${id}`)
}

// 清空购物车
export const clearCart = () => {
  return request.delete('/cart')
}

// 批量删除
export const batchDeleteCart = (ids) => {
  return request.post('/cart/batch-delete', { ids })
}
