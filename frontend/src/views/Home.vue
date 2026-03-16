<template>
  <div class="home page-container">
    <!-- 顶部搜索栏 -->
    <div class="top-bar">
      <div class="search-wrapper">
        <van-icon name="search" class="search-icon" />
        <input 
          v-model="searchValue" 
          type="text" 
          placeholder="搜索商品、品牌" 
          class="search-input"
          @keyup.enter="onSearch"
        />
      </div>
      <van-icon name="wap-nav" class="nav-icon" />
    </div>

    <!-- 轮播Banner -->
    <van-swipe class="banner" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="(image, index) in banners" :key="index">
        <img :src="image" />
      </van-swipe-item>
    </van-swipe>

    <!-- 快捷导航 -->
    <div class="quick-nav">
      <div class="nav-item" @click="goToCategory(1)">
        <div class="nav-icon-box">🔥</div>
        <span>秒杀</span>
      </div>
      <div class="nav-item" @click="goToCategory(2)">
        <div class="nav-icon-box">🎁</div>
        <span>优惠</span>
      </div>
      <div class="nav-item" @click="goToCategory(3)">
        <div class="nav-icon-box">⭐</div>
        <span>热卖</span>
      </div>
      <div class="nav-item" @click="goToCategory(4)">
        <div class="nav-icon-box">🆕</div>
        <span>新品</span>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-section">
      <div class="section-header">
        <span class="section-title">分类</span>
      </div>
      <div class="category-grid">
        <div v-for="(cat, index) in categories.slice(0, 8)" :key="cat.id" class="category-card" @click="goToCategory(cat.id)">
          <div class="category-icon">{{ cat.icon }}</div>
          <div class="category-name">{{ cat.name }}</div>
        </div>
      </div>
    </div>

    <!-- 限时秒杀 -->
    <div class="flash-sale-section">
      <div class="section-header">
        <span class="section-title">
          <van-icon name="fire-o" />
          限时秒杀
        </span>
        <span class="timer">02:35:13</span>
      </div>
      <div class="flash-products">
        <div v-for="product in flashSaleProducts.slice(0, 3)" :key="product._id" class="flash-item" @click="goToDetail(product._id)">
          <div class="flash-img">
            <img :src="product.pic" />
            <div class="flash-badge">秒杀</div>
          </div>
          <div class="flash-info">
            <div class="flash-price">¥{{ product.price }}</div>
            <div class="flash-original">¥{{ (product.price * 1.3).toFixed(2) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门商品 -->
    <div class="hot-products-section">
      <div class="section-header">
        <span class="section-title">热卖商品</span>
        <span class="more-link" @click="goToCategory(0)">更多 ></span>
      </div>
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadProducts"
      >
        <div class="product-grid">
          <div v-for="product in products" :key="product._id" class="product-item" @click="goToDetail(product._id)">
            <div class="product-img">
              <img :src="product.pic" />
              <div v-if="product.newStatus" class="badge new-badge">新</div>
              <div v-if="product.hasCommission" class="badge distribution-badge">分销</div>
            </div>
            <div class="product-detail">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">
                <span class="price">¥{{ product.price }}</span>
              </div>
              <div class="product-meta">
                <span class="sales">已售{{ product.sale }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="active" route active-color="#e63946">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="apps-o" to="/category">分类</van-tabbar-item>
      <van-tabbar-item icon="shopping-cart-o" to="/cart">购物车</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProducts } from '../api/product'
import { getCategories } from '../api/category'

const router = useRouter()
const searchValue = ref('')
const active = ref(0)
const products = ref([])
const flashSaleProducts = ref([])
const categories = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

const categoryColors = ['#5b7cfa', '#d946a6', '#22c55e', '#a855f7', '#ff6b35', '#d4a574', '#5b7cfa', '#999']
const categoryIcons = ['📱', '👕', '🏠', '💄', '⚽', '🍔', '⌚', '📦']

const banners = [
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'
]

const loadProducts = async () => {
  try {
    loading.value = true
    const res = await getProducts({ page: page.value, pageSize: 10 })
    
    if (res.data.list.length === 0) {
      finished.value = true
    } else {
      products.value.push(...res.data.list)
      page.value++
    }
  } catch (error) {
    console.error('加载商品失败', error)
  } finally {
    loading.value = false
  }
}

const loadFlashSaleProducts = async () => {
  try {
    const res = await getProducts({ pageSize: 5 })
    flashSaleProducts.value = res.data.list.slice(0, 5)
  } catch (error) {
    console.error('加载限时秒杀商品失败', error)
  }
}

const loadCategories = async () => {
  try {
    const res = await getCategories({ pageSize: 100 })
    const apiCategories = res.data || []
    // 为每个分类添加颜色和图标
    categories.value = apiCategories.map((cat, index) => ({
      ...cat,
      color: categoryColors[index % categoryColors.length],
      icon: categoryIcons[index % categoryIcons.length]
    }))
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

const onSearch = () => {
  console.log('搜索:', searchValue.value)
  router.push(`/category?search=${searchValue.value}`)
}

const goToDetail = (id) => {
  router.push(`/product/${id}`)
}

const goToCategory = (id) => {
  router.push(`/category?id=${id}`)
}

onMounted(() => {
  loadCategories()
  loadFlashSaleProducts()
  loadProducts()
})
</script>

<style scoped>
.home {
  background: #f5f5f5;
  padding-bottom: 60px;
}

/* 顶部搜索栏 */
.top-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.search-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 8px 12px;
  gap: 8px;
}

.search-icon {
  color: #999;
  font-size: 16px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.nav-icon {
  font-size: 20px;
  color: #333;
  cursor: pointer;
}

/* Banner */
.banner {
  height: 200px;
  margin: 8px 0;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 快捷导航 */
.quick-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  background: white;
  margin-bottom: 8px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-item:active {
  background: #f5f5f5;
}

.nav-icon-box {
  font-size: 24px;
  margin-bottom: 6px;
}

.nav-item span {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

/* 分类部分 */
.category-section {
  background: white;
  margin-bottom: 8px;
  padding: 12px 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title :deep(.van-icon) {
  color: #e63946;
  font-size: 18px;
}

.more-link {
  font-size: 12px;
  color: #999;
  cursor: pointer;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.category-card:active {
  transform: scale(0.95);
}

.category-icon {
  font-size: 32px;
  margin-bottom: 6px;
}

.category-name {
  font-size: 12px;
  color: #333;
  text-align: center;
  font-weight: 500;
}

/* 限时秒杀 */
.flash-sale-section {
  background: white;
  margin-bottom: 8px;
  padding: 12px 15px;
}

.timer {
  font-size: 12px;
  color: #e63946;
  font-weight: 600;
  background: #ffe5e5;
  padding: 4px 8px;
  border-radius: 4px;
}

.flash-products {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.flash-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.flash-item:active {
  transform: scale(0.95);
}

.flash-img {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.flash-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.flash-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #e63946;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 2px;
}

.flash-info {
  text-align: center;
}

.flash-price {
  font-size: 14px;
  font-weight: 600;
  color: #e63946;
  margin-bottom: 2px;
}

.flash-original {
  font-size: 11px;
  color: #999;
  text-decoration: line-through;
}

/* 热卖商品 */
.hot-products-section {
  background: white;
  padding: 12px 15px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.product-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.product-item:active {
  transform: scale(0.98);
}

.product-img {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 2px;
  color: white;
}

.new-badge {
  background: #e63946;
}

.distribution-badge {
  background: #f77f88;
  bottom: 6px;
  top: auto;
}

.product-detail {
  padding: 0 4px;
}

.product-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  margin-bottom: 4px;
}

.price {
  font-size: 15px;
  font-weight: 700;
  color: #e63946;
}

.product-meta {
  font-size: 11px;
  color: #999;
}

.sales {
  display: inline-block;
}
</style>
