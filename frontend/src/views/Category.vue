<template>
  <div class="category page-container">
    <van-nav-bar title="分类" fixed />
    <div class="content">
      <van-sidebar v-model="activeKey" @change="onCategoryChange">
        <van-sidebar-item v-for="item in categories" :key="item.id" :title="item.name" />
      </van-sidebar>
      <div class="category-content">
        <div class="product-list">
          <div v-for="product in products" :key="product._id" class="product-item" @click="goToDetail(product._id)">
            <img :src="product.pic" class="product-img" />
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">¥{{ product.price }}</div>
            </div>
          </div>
        </div>
        <van-empty v-if="products.length === 0" description="暂无商品" />
      </div>
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
import { getCategories } from '../api/category'

const router = useRouter()
const active = ref(1)
const activeKey = ref(0)
const products = ref([])
const categories = ref([])

const loadCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res.data || []
    // 加载第一个分类的商品
    if (categories.value.length > 0) {
      loadProducts(categories.value[0]._id)
    }
  } catch (error) {
    console.error('加载分类失败', error)
    // 如果加载失败，加载全部商品
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
  const category = categories.value[index]
  if (category) {
    loadProducts(category._id)
  }
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
  background: #f7f8fa;
}

.content {
  display: flex;
  padding-top: 46px;
  height: calc(100vh - 96px);
}

.van-sidebar {
  width: 100px;
}

.category-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.product-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.product-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.product-info {
  padding: 10px;
}

.product-name {
  font-size: 14px;
  color: #323233;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}
</style>
