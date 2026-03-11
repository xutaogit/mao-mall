<template>
  <div class="my-coupons">
    <van-nav-bar title="我的优惠券" left-arrow @click-left="onClickLeft" fixed />
    
    <van-tabs v-model:active="activeTab" @change="onTabChange" sticky offset-top="46px">
      <van-tab title="未使用" name="0" />
      <van-tab title="已使用" name="1" />
      <van-tab title="已过期" name="2" />
    </van-tabs>

    <div class="content">
      <van-empty v-if="!loading && coupons.length === 0" description="暂无优惠券" />

      <div v-else class="coupon-list">
        <div 
          class="coupon-item" 
          v-for="history in coupons" 
          :key="history._id"
          :class="{ 'coupon-disabled': history.useStatus !== 0 }"
        >
          <div class="coupon-left" :class="getCouponClass(history.couponId?.type)">
            <div class="coupon-amount">
              <span class="symbol">¥</span>
              <span class="value">{{ getCouponValue(history.couponId) }}</span>
            </div>
            <div class="coupon-condition">{{ getCouponCondition(history.couponId) }}</div>
          </div>
          
          <div class="coupon-right">
            <div class="coupon-name">{{ history.couponId?.name }}</div>
            <div class="coupon-time">
              {{ formatDate(history.couponId?.startTime) }} - {{ formatDate(history.couponId?.endTime) }}
            </div>
            <div class="coupon-code">券码：{{ history.couponCode }}</div>
            <div class="coupon-status">
              <van-tag v-if="history.useStatus === 0" type="success">未使用</van-tag>
              <van-tag v-else-if="history.useStatus === 1" type="default">已使用</van-tag>
              <van-tag v-else type="danger">已过期</van-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getMyCoupons } from '../api/coupon'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('0')
const coupons = ref([])

const onClickLeft = () => {
  router.back()
}

const getCouponClass = (type) => {
  const classes = ['coupon-full', 'coupon-discount', 'coupon-free']
  return classes[type] || 'coupon-full'
}

const getCouponValue = (coupon) => {
  if (!coupon) return '0'
  if (coupon.type === 1) {
    return (coupon.amount * 10).toFixed(1) + '折'
  }
  return coupon.amount
}

const getCouponCondition = (coupon) => {
  if (!coupon) return ''
  if (coupon.minPoint > 0) {
    return `满${coupon.minPoint}可用`
  }
  return '无门槛'
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getMonth() + 1}.${d.getDate()}`
}

const onTabChange = () => {
  loadCoupons()
}

const loadCoupons = async () => {
  loading.value = true
  try {
    const res = await getMyCoupons({ useStatus: activeTab.value })
    coupons.value = res.data
  } catch (error) {
    console.error('获取优惠券列表失败', error)
    showToast('获取优惠券列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCoupons()
})
</script>

<style scoped>
.my-coupons {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.content {
  padding-top: 90px;
}

.coupon-list {
  padding: 15px;
}

.coupon-item {
  display: flex;
  background: white;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.coupon-disabled {
  opacity: 0.6;
}

.coupon-left {
  width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}

.coupon-full {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.coupon-discount {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.coupon-free {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.coupon-amount {
  display: flex;
  align-items: baseline;
}

.symbol {
  font-size: 18px;
  margin-right: 2px;
}

.value {
  font-size: 32px;
  font-weight: bold;
}

.coupon-condition {
  font-size: 12px;
  margin-top: 5px;
  opacity: 0.9;
}

.coupon-right {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.coupon-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 8px;
}

.coupon-time {
  font-size: 12px;
  color: #969799;
  margin-bottom: 5px;
}

.coupon-code {
  font-size: 12px;
  color: #969799;
  margin-bottom: 10px;
}

.coupon-status {
  margin-top: auto;
}
</style>
