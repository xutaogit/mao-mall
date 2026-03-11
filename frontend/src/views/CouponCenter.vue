<template>
  <div class="coupon-center">
    <van-nav-bar title="领券中心" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content">
      <van-empty v-if="!loading && coupons.length === 0" description="暂无可领取的优惠券" />

      <div v-else class="coupon-list">
        <div class="coupon-item" v-for="coupon in coupons" :key="coupon._id">
          <div class="coupon-left" :class="getCouponClass(coupon.type)">
            <div class="coupon-amount">
              <span class="symbol">¥</span>
              <span class="value">{{ getCouponValue(coupon) }}</span>
            </div>
            <div class="coupon-condition">{{ getCouponCondition(coupon) }}</div>
          </div>
          
          <div class="coupon-right">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="coupon-time">
              {{ formatDate(coupon.startTime) }} - {{ formatDate(coupon.endTime) }}
            </div>
            <div class="coupon-note" v-if="coupon.note">{{ coupon.note }}</div>
            <div class="coupon-action">
              <van-button 
                size="small" 
                type="primary" 
                @click="handleClaim(coupon)"
                :disabled="coupon.receiveCount >= coupon.count"
              >
                {{ coupon.receiveCount >= coupon.count ? '已抢光' : '立即领取' }}
              </van-button>
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
import { getCoupons, claimCoupon } from '../api/coupon'

const router = useRouter()
const loading = ref(false)
const coupons = ref([])

const onClickLeft = () => {
  router.back()
}

const getCouponClass = (type) => {
  const classes = ['coupon-full', 'coupon-discount', 'coupon-free']
  return classes[type] || 'coupon-full'
}

const getCouponValue = (coupon) => {
  if (coupon.type === 1) {
    return (coupon.amount * 10).toFixed(1) + '折'
  }
  return coupon.amount
}

const getCouponCondition = (coupon) => {
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

const loadCoupons = async () => {
  loading.value = true
  try {
    const res = await getCoupons({ available: true })
    coupons.value = res.data.list
  } catch (error) {
    console.error('获取优惠券列表失败', error)
    showToast('获取优惠券列表失败')
  } finally {
    loading.value = false
  }
}

const handleClaim = async (coupon) => {
  try {
    await claimCoupon(coupon._id)
    showToast('领取成功')
    loadCoupons()
  } catch (error) {
    console.error('领取优惠券失败', error)
    showToast(error.response?.data?.message || '领取失败')
  }
}

onMounted(() => {
  loadCoupons()
})
</script>

<style scoped>
.coupon-center {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.content {
  padding-top: 46px;
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

.coupon-left {
  width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  position: relative;
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

.coupon-note {
  font-size: 12px;
  color: #969799;
  margin-bottom: 10px;
}

.coupon-action {
  margin-top: auto;
  text-align: right;
}
</style>
