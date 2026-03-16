<template>
  <div class="product-detail page-container">
    <div class="content">
      <!-- 产品轮播 -->
      <van-swipe class="product-swipe" :autoplay="3000">
        <van-swipe-item v-for="(image, index) in images" :key="index">
          <img :src="image" />
        </van-swipe-item>
      </van-swipe>

      <!-- 顶部操作栏 -->
      <div class="top-actions">
        <van-icon name="arrow-left" @click="onClickLeft" />
        <div class="spacer"></div>
        <van-icon name="heart-o" @click="toggleFavorite" />
        <van-icon name="share-o" @click="shareProduct" />
      </div>

      <!-- 产品信息 -->
      <div class="product-info">
        <div class="price-section">
          <span class="price">¥ {{ product.price }}</span>
          <span class="original-price" v-if="product.promotionPrice">¥{{ product.promotionPrice }}</span>
          <span v-if="product.hasCommission" class="distribution-tag">分销商品</span>
        </div>
        <div class="product-name">{{ product.name }}</div>
        <div class="product-stats">
          <span class="stat-item">月销 {{ product.sale || 0 }}+</span>
          <span class="stat-item">好评率 98%</span>
        </div>
      </div>

      <!-- 分销佣金信息 -->
      <div v-if="commission" class="commission-section">
        <div class="commission-header">
          <van-icon name="gold-coin-o" />
          <span>分销佣金</span>
        </div>
        <div class="commission-info">
          <div class="commission-text">推广此商品可获得</div>
          <div class="commission-value">{{ commissionText }}</div>
        </div>
        <div v-if="isDistributor" class="commission-action">
          <van-button size="small" type="primary" @click="shareProduct">
            <van-icon name="share-o" />
            立即推广
          </van-button>
        </div>
      </div>

      <!-- 商品详情 -->
      <div class="detail-section">
        <div class="section-title">商品详情</div>
        <div class="detail-content">
          <div class="detail-item">
            <span class="label">颜色</span>
            <span class="value">已选：雪域白</span>
          </div>
          <div class="detail-item">
            <span class="label">尺寸</span>
            <span class="value">已选：M</span>
          </div>
          <div class="detail-item">
            <span class="label">数量</span>
            <div class="quantity-control">
              <van-button size="small" @click="quantity--">−</van-button>
              <input v-model.number="quantity" type="number" min="1" />
              <van-button size="small" @click="quantity++">+</van-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="description-section">
        <div class="section-title">商品描述</div>
        <div class="description-text">{{ product.description }}</div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <van-button class="btn-cart" @click="addToCart">
        <van-icon name="shopping-cart-o" />
        加入购物车
      </van-button>
      <van-button class="btn-buy" @click="buyNow">立即购买</van-button>
    </div>

    <van-tabbar v-model="active" route active-color="#e63946">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="apps-o" to="/category">分类</van-tabbar-item>
      <van-tabbar-item icon="shopping-cart-o" to="/cart">购物车</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { getProductDetail } from '../api/product'
import { addToCart as addToCartApi } from '../api/cart'
import { getProductCommission, getDistributorInfo } from '../api/distributor'

const router = useRouter()
const route = useRoute()
const active = ref(2)

const product = ref({})
const images = ref([])
const commission = ref(null)
const distributorInfo = ref(null)
const isFavorited = ref(false)
const quantity = ref(1)

const isDistributor = computed(() => {
  return distributorInfo.value && distributorInfo.value.status === 1
})

const commissionText = computed(() => {
  if (!commission.value) return ''
  if (commission.value.commissionType === 0) {
    return `¥${commission.value.commissionValue}`
  } else {
    const amount = (product.value.price * commission.value.commissionValue / 100).toFixed(2)
    return `${commission.value.commissionValue}% (约¥${amount})`
  }
})

const shareLink = computed(() => {
  if (!distributorInfo.value || !distributorInfo.value.distributorCode) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/product/${route.params.id}?distributorCode=${distributorInfo.value.distributorCode}`
})

const onClickLeft = () => {
  router.back()
}

const loadProduct = async () => {
  try {
    const res = await getProductDetail(route.params.id)
    product.value = res.data
    
    if (product.value.albumPics && product.value.albumPics.length > 0) {
      images.value = product.value.albumPics
    } else if (product.value.pic) {
      images.value = [product.value.pic]
    } else {
      images.value = ['https://via.placeholder.com/375x375?text=No+Image']
    }

    loadDistributorInfo()
    loadCommission()
  } catch (error) {
    console.error('加载商品失败', error)
    showToast('加载失败')
  }
}

const loadDistributorInfo = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const res = await getDistributorInfo()
    if (res.data) {
      distributorInfo.value = res.data
    }
  } catch (error) {
    console.error('加载分销员信息失败:', error)
  }
}

const loadCommission = async () => {
  try {
    const res = await getProductCommission(route.params.id)
    if (res.data) {
      commission.value = res.data
    }
  } catch (error) {
    console.error('加载佣金信息失败:', error)
  }
}

const shareProduct = () => {
  showDialog({
    title: '分享商品',
    message: '选择分享方式',
    confirmButtonText: '复制链接',
    cancelButtonText: '取消',
    showCancelButton: true
  }).then(() => {
    copyShareLink()
  }).catch(() => {})
}

const copyShareLink = async () => {
  try {
    const link = `${window.location.origin}/product/${product.value._id}`
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(link)
      showToast('链接已复制')
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = link
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      showToast('链接已复制')
    }
  } catch (error) {
    console.error('复制失败:', error)
    showToast('复制失败')
  }
}

const addToCart = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    showToast('请先登录')
    router.push('/login')
    return
  }

  if (!product.value._id) {
    showToast('商品信息加载中')
    return
  }

  try {
    const res = await addToCartApi({
      productId: product.value._id,
      quantity: quantity.value
    })
    showToast('已加入购物车')
  } catch (error) {
    console.error('加入购物车失败:', error)
    showToast(error.response?.data?.message || '加入购物车失败')
  }
}

const buyNow = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    showToast('请先登录')
    router.push('/login')
    return
  }

  if (!product.value._id) {
    showToast('商品信息加载中')
    return
  }
  
  try {
    const res = await addToCartApi({
      productId: product.value._id,
      quantity: quantity.value
    })
    
    router.push(`/order/confirm?ids=${res.data._id}`)
  } catch (error) {
    console.error('购买失败:', error)
    showToast(error.response?.data?.message || '购买失败')
  }
}

const toggleFavorite = () => {
  try {
    let favorites = []
    const saved = localStorage.getItem('favorites')
    if (saved) {
      favorites = JSON.parse(saved)
    }

    const index = favorites.findIndex(item => item._id === product.value._id)
    
    if (index > -1) {
      favorites.splice(index, 1)
      isFavorited.value = false
      showToast('已取消收藏')
    } else {
      favorites.push({
        _id: product.value._id,
        name: product.value.name,
        pic: product.value.pic || images.value[0],
        price: product.value.price
      })
      isFavorited.value = true
      showToast('已收藏')
    }

    localStorage.setItem('favorites', JSON.stringify(favorites))
  } catch (error) {
    console.error('收藏操作失败:', error)
    showToast('操作失败')
  }
}

const checkFavorited = () => {
  try {
    const saved = localStorage.getItem('favorites')
    if (saved) {
      const favorites = JSON.parse(saved)
      isFavorited.value = favorites.some(item => item._id === product.value._id)
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

const checkAndBindDistributor = async () => {
  const distributorCode = route.query.distributorCode
  if (!distributorCode) return

  const token = localStorage.getItem('token')
  if (!token) {
    localStorage.setItem('pendingDistributorCode', distributorCode)
    return
  }

  try {
    const { bindDistributor } = await import('../api/distributor')
    await bindDistributor({ distributorCode })
    console.log('分销关系绑定成功')
  } catch (error) {
    console.error('绑定分销关系失败:', error)
  }
}

onMounted(() => {
  loadProduct()
  checkAndBindDistributor()
  setTimeout(() => {
    checkFavorited()
  }, 500)
})
</script>

<style scoped>
.product-detail {
  padding-bottom: 180px;
  background: #f5f5f5;
  min-height: 100vh;
}

.content {
  padding-top: 0;
}

/* 产品轮播 */
.product-swipe {
  height: 360px;
  position: relative;
}

.product-swipe img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 顶部操作栏 */
.top-actions {
  position: absolute;
  top: 12px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  z-index: 10;
}

.top-actions :deep(.van-icon) {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  color: #333;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.spacer {
  flex: 1;
}

/* 产品信息 */
.product-info {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
}

.price-section {
  margin-bottom: 12px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.price {
  font-size: 28px;
  font-weight: 700;
  color: #e63946;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
}

.product-stats {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #666;
}

.stat-item {
  display: flex;
  align-items: center;
}

/* 分销佣金信息 */
.commission-section {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
  border-left: 4px solid #e63946;
}

.commission-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.commission-header :deep(.van-icon) {
  color: #e63946;
  font-size: 18px;
}

.commission-info {
  margin-bottom: 12px;
}

.commission-text {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.commission-value {
  font-size: 18px;
  font-weight: 700;
  color: #e63946;
}

.commission-action {
  display: flex;
  gap: 10px;
}

.commission-action :deep(.van-button) {
  flex: 1;
  background: #e63946;
  border: none;
}

.distribution-tag {
  display: inline-block;
  background: #f77f88;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
}

/* 详情部分 */
.detail-section {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-control input {
  width: 40px;
  height: 32px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.quantity-control :deep(.van-button) {
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 16px;
}

/* 描述部分 */
.description-section {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
}

.description-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  gap: 10px;
  padding: 12px 15px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.btn-cart {
  flex: 1;
  background: #f77f88;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
}

.btn-buy {
  flex: 1;
  background: #e63946;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
}

.btn-cart :deep(.van-button__text),
.btn-buy :deep(.van-button__text) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
</style>
