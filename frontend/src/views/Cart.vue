<template>
  <div class="cart page-container">
    <van-nav-bar title="购物车" fixed />
    
    <div class="content">
      <van-empty v-if="!loading && cartItems.length === 0" description="购物车是空的">
        <van-button round type="primary" @click="goToHome">去逛逛</van-button>
      </van-empty>

      <van-checkbox-group v-model="checkedItems" v-else>
        <van-swipe-cell v-for="item in cartItems" :key="item._id">
          <div class="cart-item">
            <van-checkbox :name="item._id" />
            <img :src="item.productId?.pic || item.productPic" class="product-image" @click="goToDetail(item.productId?._id)" />
            <div class="product-info">
              <div class="product-name">{{ item.productId?.name || item.productName }}</div>
              <div class="product-bottom">
                <span class="price">¥{{ item.price }}</span>
                <van-stepper 
                  v-model="item.quantity" 
                  :min="1" 
                  :max="item.productId?.stock || 999"
                  @change="handleQuantityChange(item)"
                />
              </div>
            </div>
          </div>
          <template #right>
            <van-button square type="danger" text="删除" @click="handleDelete(item._id)" />
          </template>
        </van-swipe-cell>
      </van-checkbox-group>
    </div>

    <van-submit-bar
      v-if="cartItems.length > 0"
      :price="totalPrice"
      button-text="结算"
      @submit="onSubmit"
    >
      <van-checkbox v-model="checkAll" @click="handleCheckAll">全选</van-checkbox>
    </van-submit-bar>

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
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getCart, updateCartItem, deleteCartItem } from '../api/cart'

const router = useRouter()
const active = ref(2)
const loading = ref(false)
const cartItems = ref([])
const checkedItems = ref([])

const checkAll = computed({
  get() {
    return cartItems.value.length > 0 && checkedItems.value.length === cartItems.value.length
  },
  set(val) {
    if (val) {
      checkedItems.value = cartItems.value.map(item => item._id)
    } else {
      checkedItems.value = []
    }
  }
})

const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => checkedItems.value.includes(item._id))
    .reduce((total, item) => total + item.price * item.quantity, 0) * 100
})

const loadCart = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    return
  }

  loading.value = true
  try {
    const res = await getCart()
    cartItems.value = res.data
  } catch (error) {
    console.error('获取购物车失败', error)
    if (error.response?.status === 401) {
      showToast('请先登录')
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

const handleQuantityChange = async (item) => {
  try {
    await updateCartItem(item._id, { quantity: item.quantity })
  } catch (error) {
    console.error('更新数量失败', error)
    showToast('更新失败')
    loadCart() // 重新加载
  }
}

const handleDelete = async (id) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要删除该商品吗？'
    })
    
    await deleteCartItem(id)
    showToast('删除成功')
    loadCart()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
      showToast('删除失败')
    }
  }
}

const handleCheckAll = () => {
  checkAll.value = !checkAll.value
}

const onSubmit = () => {
  if (checkedItems.value.length === 0) {
    showToast('请选择商品')
    return
  }
  
  // 跳转到订单确认页
  const ids = checkedItems.value.join(',')
  router.push(`/order/confirm?ids=${ids}`)
}

const goToHome = () => {
  router.push('/')
}

const goToDetail = (id) => {
  if (id) {
    router.push(`/product/${id}`)
  }
}

onMounted(() => {
  loadCart()
})
</script>

<style scoped>
.cart {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 100px;
}

.content {
  padding-top: 46px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: white;
  margin-bottom: 8px;
  gap: 12px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  cursor: pointer;
  background: #f0f0f0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 80px;
}

.product-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 15px;
  font-weight: 700;
  color: #e63946;
}

.cart-item :deep(.van-checkbox) {
  margin-right: 8px;
}

.cart-item :deep(.van-stepper) {
  transform: scale(0.9);
}

/* 提交栏 */
:deep(.van-submit-bar) {
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.van-submit-bar__button) {
  background: #e63946;
  border: none;
}

:deep(.van-submit-bar__text) {
  color: #e63946;
  font-weight: 600;
}
</style>
