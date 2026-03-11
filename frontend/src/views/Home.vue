<template>
  <div class="home page-container">
    <van-search v-model="searchValue" placeholder="搜索商品" @search="onSearch" />
    
    <van-swipe class="banner" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="(image, index) in banners" :key="index">
        <img :src="image" />
      </van-swipe-item>
    </van-swipe>

    <div class="category-nav">
      <div v-for="cat in categories" :key="cat.id" class="category-item" @click="goToCategory(cat.id)">
        <div class="category-icon">{{ cat.icon }}</div>
        <div class="category-name">{{ cat.name }}</div>
      </div>
    </div>

    <div class="section-title">
      <span class="title-text">热门推荐</span>
    </div>

    <div class="product-list">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadProducts"
      >
        <div class="product-grid">
          <div v-for="product in products" :key="product._id" class="product-card" @click="goToDetail(product._id)">
            <img :src="product.pic" class="product-image" />
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-subtitle">{{ product.subTitle }}</div>
              <div class="product-bottom">
                <span class="price">¥{{ product.price }}</span>
                <span class="sale">已售{{ product.sale }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </div>

    <van-tabbar v-model="active" route>
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

const router = useRouter()
const searchValue = ref('')
const active = ref(0)
const products = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

const banners = [
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'
]

const categories = [
  { id: 1, name: '手机数码', icon: '📱' },
  { id: 2, name: '电脑办公', icon: '💻' },
  { id: 3, name: '家用电器', icon: '🏠' },
  { id: 4, name: '服饰鞋包', icon: '👔' },
  { id: 5, name: '美妆护肤', icon: '💄' },
  { id: 6, name: '运动户外', icon: '⚽' }
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

const onSearch = () => {
  console.log('搜索:', searchValue.value)
}

const goToDetail = (id) => {
  console.log('跳转到商品详情，ID:', id)
  router.push(`/product/${id}`)
}

const goToCategory = (id) => {
  router.push(`/category?id=${id}`)
}
</script>

<style scoped>
.home {
  background: #f7f8fa;
}

.banner {
  height: 200px;
  margin-bottom: 10px;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 15px;
  background: white;
  margin-bottom: 10px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.category-icon {
  font-size: 32px;
  margin-bottom: 5px;
}

.category-name {
  font-size: 12px;
  color: #646566;
}

.section-title {
  padding: 15px;
  background: white;
  margin-bottom: 10px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  position: relative;
  padding-left: 10px;
}

.title-text::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background: var(--primary-color);
}

.product-list {
  padding: 10px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:active {
  transform: scale(0.98);
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.product-info {
  padding: 10px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-subtitle {
  font-size: 12px;
  color: #969799;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

.sale {
  font-size: 12px;
  color: #969799;
}
</style>
