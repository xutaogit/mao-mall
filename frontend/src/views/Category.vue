<template>
  <div class="category page-container">
    <van-nav-bar title="分类" left-arrow @click-left="onClickLeft" fixed />
    <div class="content">
      <div class="sidebar">
        <div 
          v-for="(item, index) in categories" 
          :key="item.id" 
          class="sidebar-item"
          :class="{ active: activeKey === index }"
          @click="onCategoryChange(index)"
        >
          {{ item.name }}
        </div>
      </div>
      <div class="category-content">
        <div class="filter-bar">
          <div class="filter-item" :class="{ active: sortBy === 'default' }" @click="sortBy = 'default'">综合</div>
          <div class="filter-item" :class="{ active: sortBy === 'sales' }" @click="sortBy = 'sales'">销量</div>
          <div class="filter-item" :class="{ active: sortBy === 'price-asc' }" @click="sortBy = 'price-asc'">价格↑</div>
          <div class="filter-item" :class="{ active: sortBy === 'price-desc' }" @click="sortBy = 'price-desc'">价格↓</div>
        </div>
        <div class="product-list">
          <div v-for="product in products" :key="product._id" class="product-item" @click="goToDetail(product._id)">
            <div class="product-img-wrapper">
              <img :src="product.pic" class="product-img" />
              <div v-if="product.newStatus" class="product-tag">新品</div>
              <div v-if="product.hasCommission" class="product-tag distribution-tag">分销</div>
            </div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">¥{{ product.price }}</div>
              <div class="product-sales">已售{{ product.sale }}</div>
            </div>
          </div>
        </div>
        <van-empty v-if="products.length === 0" description="暂无商品" />
      </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProducts } from '../api/product'
import { getCategories } from '../api/category'

const router = useRouter()
const active = ref(1)
const activeKey = ref(0)
const products = ref([])
const categories = ref([])
const sortBy = ref('default')

const loadCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res.data || []
    if (categories.value.length > 0) {
      loadProducts(categories.value[0]._id)
    }
  } catch (error) {
    console.error('加载分类失败', error)
    loadProducts(null)
  }
}

const loadProducts = async (categoryId) => {
  try {
    const params = { pageSize: 20 }
    if (categoryId) params.categoryId = categoryId
    const res = await getProducts(params)
    products.value = res.data.list
  } catch (error) {
    console.error('加载商品失败', error)
  }
}

const onCategoryChange = (index) => {
  activeKey.value = index
  const category = categories.value[index]
  if (category) {
    loadProducts(category._id)
  }
}

const onClickLeft = () => {
  router.back()
}

const goToDetail = (id) => {
  router.push(`/product/${id}`)
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category {
  background: #f5f5f5;
  padding-bottom: 60px;
}

.content {
  display: flex;
  padding-top: 46px;
  height: calc(100vh - 96px);
}

/* 侧边栏 */
.sidebar {
  width: 90px;
  background: white;
  overflow-y: auto;
}

.sidebar-item {
  padding: 18px 10px;
  text-align: center;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  font-weight: 500;
}

.sidebar-item.active {
  background: #f5f5f5;
  color: #e63946;
  font-weight: 600;
}

.sidebar-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #e63946;
  border-radius: 0 2px 2px 0;
}

/* 分类内容区 */
.category-content {
  flex: 1;
  overflow-y: auto;
  background: #f5f5f5;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  background: white;
  padding: 12px 15px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-item {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  padding: 6px 0;
  transition: all 0.3s;
  font-weight: 500;
}

.filter-item.active {
  color: #e63946;
  font-weight: 600;
}

/* 商品列表 */
.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
}

.product-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.product-item:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-img-wrapper {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #f0f0f0;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #e63946;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.distribution-tag {
  background: #f77f88;
  left: auto;
  right: 8px;
}

.product-info {
  padding: 10px;
}

.product-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 15px;
  font-weight: 700;
  color: #e63946;
  margin-bottom: 4px;
}

.product-sales {
  font-size: 11px;
  color: #999;
}
</style>
