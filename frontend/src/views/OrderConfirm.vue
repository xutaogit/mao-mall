<template>
  <div class="order-confirm">
    <van-nav-bar title="确认订单" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content">
      <!-- 收货地址 -->
      <div class="address-section" @click="goToSelectAddress">
        <div v-if="selectedAddress" class="address-info">
          <div class="address-header">
            <van-icon name="location-o" />
            <span class="name">{{ selectedAddress.name }}</span>
            <span class="phone">{{ selectedAddress.phone }}</span>
          </div>
          <div class="address-detail">
            {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.region }} {{ selectedAddress.detailAddress }}
          </div>
        </div>
        <div v-else class="no-address">
          <van-icon name="add-o" />
          <span>请选择收货地址</span>
        </div>
        <van-icon name="arrow" />
      </div>

      <!-- 商品列表 -->
      <div class="goods-section">
        <div class="goods-item" v-for="item in orderItems" :key="item._id">
          <img :src="item.productId?.pic || item.productPic" class="goods-image" />
          <div class="goods-info">
            <div class="goods-name">{{ item.productId?.name || item.productName }}</div>
            <div class="goods-bottom">
              <span class="price">¥{{ item.price }}</span>
              <span class="quantity">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 优惠券选择 -->
      <van-cell-group class="coupon-section">
        <van-cell 
          title="优惠券" 
          is-link 
          :value="selectedCoupon ? `-¥${couponDiscount.toFixed(2)}` : '请选择优惠券'"
          @click="showCouponPicker = true"
        />
      </van-cell-group>

      <!-- 备注 -->
      <van-cell-group>
        <van-field
          v-model="note"
          label="订单备注"
          placeholder="选填，可以告诉卖家您的特殊需求"
          type="textarea"
          rows="2"
        />
      </van-cell-group>

      <!-- 价格明细 -->
      <van-cell-group class="price-section">
        <van-cell title="商品金额" :value="`¥${totalAmount.toFixed(2)}`" />
        <van-cell title="运费" value="¥0.00" />
        <van-cell v-if="selectedCoupon" title="优惠券" :value="`-¥${couponDiscount.toFixed(2)}`" value-class="discount" />
      </van-cell-group>
    </div>

    <van-submit-bar
      :price="finalAmount * 100"
      button-text="提交订单"
      @submit="onSubmit"
      :loading="loading"
    />

    <!-- 优惠券选择弹窗 -->
    <van-popup v-model:show="showCouponPicker" position="bottom" round>
      <div class="coupon-picker">
        <div class="picker-header">
          <span>选择优惠券</span>
          <van-icon name="cross" @click="showCouponPicker = false" />
        </div>
        <div class="coupon-list">
          <div 
            class="coupon-option" 
            v-for="coupon in availableCoupons" 
            :key="coupon._id"
            :class="{ 'coupon-selected': selectedCoupon?._id === coupon._id }"
            @click="selectCoupon(coupon)"
          >
            <div class="coupon-info">
              <div class="coupon-amount">¥{{ getCouponValue(coupon.couponId) }}</div>
              <div class="coupon-name">{{ coupon.couponId?.name }}</div>
            </div>
            <van-icon v-if="selectedCoupon?._id === coupon._id" name="success" color="#07c160" />
          </div>
          <div class="coupon-option" @click="selectCoupon(null)">
            <div class="coupon-info">
              <div class="coupon-name">不使用优惠券</div>
            </div>
            <van-icon v-if="!selectedCoupon" name="success" color="#07c160" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getCart } from '../api/cart'
import { getAddresses } from '../api/address'
import { createOrder } from '../api/order'
import { getMyCoupons, useCoupon } from '../api/coupon'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const orderItems = ref([])
const selectedAddress = ref(null)
const note = ref('')
const showCouponPicker = ref(false)
const availableCoupons = ref([])
const selectedCoupon = ref(null)

const totalAmount = computed(() => {
  return orderItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
})

const couponDiscount = computed(() => {
  if (!selectedCoupon.value) return 0
  const coupon = selectedCoupon.value.couponId
  if (!coupon) return 0
  
  // 检查是否满足使用条件
  if (coupon.minPoint > 0 && totalAmount.value < coupon.minPoint) {
    return 0
  }
  
  // 计算折扣
  if (coupon.type === 0) {
    // 满减券
    return coupon.amount
  } else if (coupon.type === 1) {
    // 折扣券
    return totalAmount.value * (1 - coupon.amount)
  } else if (coupon.type === 2) {
    // 无门槛券
    return coupon.amount
  }
  return 0
})

const finalAmount = computed(() => {
  return Math.max(0, totalAmount.value - couponDiscount.value)
})

const onClickLeft = () => {
  router.back()
}

const loadCartItems = async () => {
  try {
    const res = await getCart()
    // 从路由参数获取选中的商品ID
    const selectedIds = route.query.ids ? route.query.ids.split(',') : []
    orderItems.value = res.data.filter(item => selectedIds.includes(item._id))
  } catch (error) {
    console.error('获取购物车失败', error)
    showToast('获取购物车失败')
  }
}

const loadDefaultAddress = async () => {
  try {
    const res = await getAddresses()
    // 查找默认地址
    selectedAddress.value = res.data.find(addr => addr.defaultStatus === 1) || res.data[0]
  } catch (error) {
    console.error('获取地址失败', error)
  }
}

const loadAvailableCoupons = async () => {
  try {
    const res = await getMyCoupons({ useStatus: 0 })
    // 过滤可用的优惠券
    availableCoupons.value = res.data.filter(coupon => {
      const c = coupon.couponId
      if (!c) return false
      // 检查是否过期
      if (new Date(c.endTime) < new Date()) return false
      // 检查是否满足使用条件
      if (c.minPoint > 0 && totalAmount.value < c.minPoint) return false
      return true
    })
  } catch (error) {
    console.error('获取优惠券失败', error)
  }
}

const getCouponValue = (coupon) => {
  if (!coupon) return '0'
  if (coupon.type === 1) {
    return (coupon.amount * 10).toFixed(1) + '折'
  }
  return coupon.amount
}

const selectCoupon = (coupon) => {
  selectedCoupon.value = coupon
  showCouponPicker.value = false
}

const goToSelectAddress = () => {
  router.push('/addresses')
}

const onSubmit = async () => {
  if (!selectedAddress.value) {
    showToast('请选择收货地址')
    return
  }

  if (orderItems.value.length === 0) {
    showToast('没有选中的商品')
    return
  }

  loading.value = true
  try {
    const res = await createOrder({
      addressId: selectedAddress.value._id,
      cartItemIds: orderItems.value.map(item => item._id),
      note: note.value
    })

    // 如果使用了优惠券，标记为已使用
    if (selectedCoupon.value) {
      try {
        await useCoupon({
          couponCode: selectedCoupon.value.couponCode,
          orderId: res.data._id,
          orderSn: res.data.orderSn
        })
      } catch (error) {
        console.error('使用优惠券失败', error)
      }
    }

    showToast('订单创建成功')
    
    // 跳转到订单详情或支付页面
    setTimeout(() => {
      router.replace(`/order/${res.data._id}`)
    }, 1000)
  } catch (error) {
    console.error('创建订单失败', error)
    showToast(error.response?.data?.message || '创建订单失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCartItems()
  loadDefaultAddress()
  loadAvailableCoupons()
})
</script>

<style scoped>
.order-confirm {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 50px;
}

.content {
  padding-top: 46px;
}

.address-section {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.address-info {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 600;
}

.address-detail {
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
}

.no-address {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #969799;
}

.goods-section {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
}

.goods-item {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.goods-item:last-child {
  margin-bottom: 0;
}

.goods-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 14px;
  color: #323233;
  line-height: 1.4;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

.quantity {
  font-size: 14px;
  color: #969799;
}

.price-section {
  margin-top: 10px;
}

.discount {
  color: #07c160;
}

.coupon-picker {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coupon-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
}

.coupon-selected {
  background: #e8f8f0;
  border: 1px solid #07c160;
}

.coupon-info {
  flex: 1;
}

.coupon-amount {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.coupon-name {
  font-size: 14px;
  color: #646566;
}
</style>
