<template>
  <div class="product-detail page-container">
    <van-nav-bar title="商品详情" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content">
      <van-swipe class="product-swipe" :autoplay="3000">
        <van-swipe-item v-for="(image, index) in images" :key="index">
          <img :src="image" />
        </van-swipe-item>
      </van-swipe>

      <div class="product-info">
        <div class="price-section">
          <span class="price">¥{{ product.price }}</span>
          <span class="original-price" v-if="product.promotionPrice">¥{{ product.promotionPrice }}</span>
        </div>
        <div class="product-name">{{ product.name }}</div>
        <div class="product-subtitle">{{ product.subTitle }}</div>
        <div class="product-tags">
          <van-tag type="danger" v-if="product.newStatus">新品</van-tag>
          <van-tag type="primary" v-if="product.recommendStatus">推荐</van-tag>
        </div>
      </div>

      <van-cell-group class="detail-group">
        <van-cell title="库存" :value="`${product.stock || 0} ${product.unit || '件'}`" />
        <van-cell title="已售" :value="`${product.sale || 0} 件`" />
        <van-cell v-if="isDistributor && commission" title="推广佣金" :value="commissionText" label="推广此商品可获得" />
      </van-cell-group>

      <!-- 分销员推广工具 -->
      <div v-if="isDistributor && commission" class="share-section">
        <div class="share-title">🎁 推广赚佣金</div>
        <div class="share-tip">分享给好友购买，即可获得 {{ commissionText }} 佣金</div>
        <div class="share-actions">
          <van-button type="primary" size="small" icon="share-o" @click="shareToWechat">
            分享到微信
          </van-button>
          <van-button type="success" size="small" icon="link-o" @click="copyShareLink">
            复制推广链接
          </van-button>
        </div>
      </div>

      <div class="detail-content">
        <div class="detail-title">商品详情</div>
        <div class="detail-desc">{{ product.description }}</div>
        <div v-if="product.detailHtml" v-html="product.detailHtml"></div>
      </div>
    </div>

    <van-action-bar safe-area-inset-bottom style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;">
      <van-action-bar-icon icon="chat-o" text="客服" />
      <van-action-bar-icon icon="cart-o" text="购物车" @click="goToCart" />
      <van-action-bar-icon 
        :icon="isFavorited ? 'star' : 'star-o'" 
        :text="isFavorited ? '已收藏' : '收藏'" 
        @click="toggleFavorite"
      />
      <van-action-bar-button type="warning" text="加入购物车" @click="addToCart" />
      <van-action-bar-button type="danger" text="立即购买" @click="buyNow" />
    </van-action-bar>
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

const product = ref({})
const images = ref([])
const commission = ref(null)
const distributorInfo = ref(null)
const isFavorited = ref(false)

// 是否是分销员
const isDistributor = computed(() => {
  return distributorInfo.value && distributorInfo.value.status === 1
})

// 计算佣金显示文本
const commissionText = computed(() => {
  if (!commission.value) return ''
  if (commission.value.commissionType === 0) {
    return `¥${commission.value.commissionValue}`
  } else {
    const amount = (product.value.price * commission.value.commissionValue / 100).toFixed(2)
    return `${commission.value.commissionValue}% (约¥${amount})`
  }
})

// 生成推广链接
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
    console.log('商品数据:', product.value)
    
    // 处理图片数组
    if (product.value.albumPics && product.value.albumPics.length > 0) {
      images.value = product.value.albumPics
    } else if (product.value.pic) {
      images.value = [product.value.pic]
    } else {
      images.value = ['https://via.placeholder.com/375x375?text=No+Image']
    }

    // 加载分销员信息和佣金信息
    loadDistributorInfo()
    loadCommission()
  } catch (error) {
    console.error('加载商品失败', error)
    showToast('加载失败')
  }
}

// 加载分销员信息
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

// 加载佣金信息
const loadCommission = async () => {
  try {
    const res = await getProductCommission(route.params.id)
    if (res.data) {
      commission.value = res.data
    }
  } catch (error) {
    console.error('加载佣金信息失败:', error)
    // 不显示错误提示，佣金信息是可选的
  }
}

// 分享到微信
const shareToWechat = () => {
  // 检查是否在微信环境
  const isWechat = /micromessenger/i.test(navigator.userAgent)
  
  if (isWechat) {
    // 在微信中，显示提示引导用户点击右上角分享
    showDialog({
      title: '分享到微信',
      message: '请点击右上角"..."按钮\n选择"发送给朋友"或"分享到朋友圈"',
      confirmButtonText: '我知道了'
    })
  } else {
    // 不在微信中，显示推广链接和二维码
    showDialog({
      title: '分享推广链接',
      message: `复制以下链接分享给好友：\n\n${shareLink.value}\n\n或扫描二维码分享`,
      confirmButtonText: '复制链接',
      cancelButtonText: '关闭',
      showCancelButton: true
    }).then(() => {
      copyShareLink()
    }).catch(() => {
      // 取消
    })
  }
}

// 复制推广链接
const copyShareLink = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareLink.value)
      showToast('推广链接已复制')
    } else {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = shareLink.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      showToast('推广链接已复制')
    }
  } catch (error) {
    console.error('复制失败:', error)
    showToast('复制失败，请手动复制')
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
      quantity: 1
    })
    console.log('加入购物车成功:', res)
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
    // 先加入购物车
    const res = await addToCartApi({
      productId: product.value._id,
      quantity: 1
    })
    
    console.log('立即购买，购物车项:', res.data)
    
    // 直接跳转到订单确认页
    router.push(`/order/confirm?ids=${res.data._id}`)
  } catch (error) {
    console.error('购买失败:', error)
    showToast(error.response?.data?.message || '购买失败')
  }
}

const goToCart = () => {
  router.push('/cart')
}

// 切换收藏状态
const toggleFavorite = () => {
  try {
    let favorites = []
    const saved = localStorage.getItem('favorites')
    if (saved) {
      favorites = JSON.parse(saved)
    }

    const index = favorites.findIndex(item => item._id === product.value._id)
    
    if (index > -1) {
      // 已收藏，移除
      favorites.splice(index, 1)
      isFavorited.value = false
      showToast('已取消收藏')
    } else {
      // 未收藏，添加
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

// 检查是否已收藏
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

// 检查并绑定分销关系
const checkAndBindDistributor = async () => {
  const distributorCode = route.query.distributorCode
  if (!distributorCode) return

  const token = localStorage.getItem('token')
  if (!token) {
    // 未登录，保存分销员代码到 localStorage，登录后再绑定
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
  // 延迟检查收藏状态，确保商品数据已加载
  setTimeout(() => {
    checkFavorited()
  }, 500)
})
</script>

<style scoped>
.product-detail {
  padding-bottom: 100px;
  background: #f7f8fa;
  min-height: 100vh;
}

.content {
  padding-top: 46px;
  padding-bottom: 60px;
}

.product-swipe {
  height: 375px;
}

.product-swipe img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px;
  background: white;
  margin-bottom: 10px;
}

.price-section {
  margin-bottom: 10px;
}

.price {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
  margin-right: 10px;
}

.original-price {
  font-size: 14px;
  color: #969799;
  text-decoration: line-through;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 5px;
}

.product-subtitle {
  font-size: 13px;
  color: #969799;
  margin-bottom: 10px;
}

.product-tags {
  display: flex;
  gap: 8px;
}

.detail-group {
  margin-bottom: 10px;
}

.detail-content {
  background: white;
  padding: 15px;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebedf0;
}

.detail-desc {
  font-size: 14px;
  color: #646566;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* 确保底部操作栏可见 */
.van-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

/* 分销员推广工具 */
.share-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  color: white;
}

.share-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.share-tip {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 12px;
}

.share-actions {
  display: flex;
  gap: 10px;
}

.share-actions .van-button {
  flex: 1;
}
</style>
