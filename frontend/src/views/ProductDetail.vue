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
      </van-cell-group>

      <div class="detail-content">
        <div class="detail-title">商品详情</div>
        <div class="detail-desc">{{ product.description }}</div>
        <div v-if="product.detailHtml" v-html="product.detailHtml"></div>
      </div>
    </div>

    <van-action-bar safe-area-inset-bottom style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;">
      <van-action-bar-icon icon="chat-o" text="客服" />
      <van-action-bar-icon icon="cart-o" text="购物车" @click="goToCart" />
      <van-action-bar-icon icon="star-o" text="收藏" />
      <van-action-bar-button type="warning" text="加入购物车" @click="addToCart" />
      <van-action-bar-button type="danger" text="立即购买" @click="buyNow" />
    </van-action-bar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getProductDetail } from '../api/product'
import { addToCart as addToCartApi } from '../api/cart'

const router = useRouter()
const route = useRoute()

const product = ref({})
const images = ref([])

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
  } catch (error) {
    console.error('加载商品失败', error)
    showToast('加载失败')
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

onMounted(() => {
  loadProduct()
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
</style>
