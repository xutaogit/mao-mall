<template>
  <div class="my-favorites">
    <van-nav-bar title="我的收藏" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content">
      <div v-if="favorites.length === 0" class="empty-state">
        <van-empty description="暂无收藏商品" />
        <van-button round block type="primary" @click="router.push('/')">
          去逛逛
        </van-button>
      </div>

      <div v-else class="favorites-list">
        <div v-for="item in favorites" :key="item._id" class="favorite-item">
          <div class="item-image">
            <img :src="item.pic" :alt="item.name" />
            <van-icon 
              name="close" 
              class="remove-btn"
              @click="removeFavorite(item._id)"
            />
          </div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-price">¥{{ item.price }}</div>
            <van-button 
              size="small" 
              type="primary" 
              @click="router.push(`/product/${item._id}`)"
            >
              查看详情
            </van-button>
          </div>
        </div>
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
import { showToast } from 'vant'

const router = useRouter()
const active = ref(3)
const favorites = ref([])

const onClickLeft = () => {
  router.back()
}

const loadFavorites = () => {
  try {
    const saved = localStorage.getItem('favorites')
    if (saved) {
      favorites.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载收藏失败', error)
  }
}

const removeFavorite = (productId) => {
  favorites.value = favorites.value.filter(item => item._id !== productId)
  localStorage.setItem('favorites', JSON.stringify(favorites.value))
  showToast('已移除收藏')
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.my-favorites {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding-top: 46px;
  padding-bottom: 50px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  padding: 20px;
}

.empty-state :deep(.van-button) {
  width: 100%;
  max-width: 200px;
}

.favorites-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
}

.favorite-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.item-image {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
}

.item-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.item-info {
  padding: 10px;
}

.item-name {
  font-size: 13px;
  color: #323233;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 8px;
}

.item-info :deep(.van-button) {
  width: 100%;
}
</style>

