<template>
  <div class="user page-container">
    <div class="user-header">
      <div class="user-info" @click="handleUserClick">
        <img :src="userInfo?.icon || defaultAvatar" class="avatar" />
        <div class="info">
          <div class="name">{{ userInfo?.nickname || '点击登录' }}</div>
          <div class="phone">{{ userInfo?.phone || '登录后查看更多功能' }}</div>
        </div>
      </div>
    </div>

    <div class="order-section" v-if="isLoggedIn">
      <div class="section-header">
        <span class="section-title">我的订单</span>
        <span class="section-more" @click="router.push('/orders')">全部订单 ></span>
      </div>
      <div class="order-tabs">
        <div class="order-tab" @click="router.push('/orders?status=0')">
          <van-badge :content="orderCounts[0] || ''" max="99">
            <van-icon name="pending-payment" size="28" />
          </van-badge>
          <span>待付款</span>
        </div>
        <div class="order-tab" @click="router.push('/orders?status=1')">
          <van-badge :content="orderCounts[1] || ''" max="99">
            <van-icon name="tosend" size="28" />
          </van-badge>
          <span>待发货</span>
        </div>
        <div class="order-tab" @click="router.push('/orders?status=2')">
          <van-badge :content="orderCounts[2] || ''" max="99">
            <van-icon name="logistics" size="28" />
          </van-badge>
          <span>待收货</span>
        </div>
        <div class="order-tab" @click="router.push('/orders?status=3')">
          <van-badge :content="orderCounts[3] || ''" max="99">
            <van-icon name="completed" size="28" />
          </van-badge>
          <span>已完成</span>
        </div>
      </div>
    </div>

    <van-cell-group class="menu-group">
      <van-cell title="我的订单" is-link to="/orders" icon="orders-o" />
      <van-cell title="退款/售后" is-link to="/refunds" icon="after-sale" />
      <van-cell title="我的优惠券" is-link to="/my-coupons" icon="coupon-o" />
      <van-cell title="收货地址" is-link to="/addresses" icon="location-o" />
      <van-cell title="我的收藏" is-link icon="star-o" />
    </van-cell-group>

    <van-cell-group class="menu-group">
      <van-cell title="设置" is-link icon="setting-o" />
      <van-cell v-if="isLoggedIn" title="退出登录" icon="logout" @click="handleLogout" />
    </van-cell-group>

    <van-tabbar v-model="active" route>
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
import { showConfirmDialog, showToast } from 'vant'
import { getUserInfo, logout } from '../api/auth'
import { getOrders } from '../api/order'

const router = useRouter()
const active = ref(3)
const userInfo = ref(null)
const orderCounts = ref({ 0: 0, 1: 0, 2: 0, 3: 0 })
const defaultAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg'

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token')
})

const loadUserInfo = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await getUserInfo()
    userInfo.value = res.data
    localStorage.setItem('userInfo', JSON.stringify(res.data))
  } catch (error) {
    console.error('获取用户信息失败', error)
    if (error.response?.status === 401) {
      logout()
      userInfo.value = null
    }
  }
}

const loadOrderCounts = async () => {
  if (!isLoggedIn.value) return
  try {
    // 并发请求各状态订单数量
    const statuses = [0, 1, 2, 3]
    const results = await Promise.allSettled(
      statuses.map(status => getOrders({ status, pageSize: 1 }))
    )
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const total = result.value?.data?.total || 0
        orderCounts.value[statuses[index]] = total > 0 ? total : ''
      }
    })
  } catch (error) {
    console.error('获取订单数量失败', error)
  }
}

const handleUserClick = () => {
  if (!isLoggedIn.value) {
    router.push('/login')
  }
}

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要退出登录吗？'
    })
    logout()
    userInfo.value = null
    orderCounts.value = { 0: '', 1: '', 2: '', 3: '' }
    showToast('已退出登录')
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  const savedUserInfo = localStorage.getItem('userInfo')
  if (savedUserInfo) {
    userInfo.value = JSON.parse(savedUserInfo)
  }
  loadUserInfo()
  loadOrderCounts()
})
</script>

<style scoped>
.user {
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 50px;
}

.user-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff6034 100%);
  padding: 40px 20px 30px;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.info {
  flex: 1;
}

.name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.phone {
  font-size: 13px;
  opacity: 0.8;
}

.order-section {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.section-more {
  font-size: 13px;
  color: #969799;
  cursor: pointer;
}

.order-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.order-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 0;
}

.order-tab span {
  font-size: 12px;
  color: #646566;
}

.menu-group {
  margin-top: 10px;
}
</style>
