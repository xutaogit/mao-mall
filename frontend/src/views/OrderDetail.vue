<template>
  <div class="order-detail">
    <van-nav-bar title="订单详情" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content" v-if="order">
      <!-- 订单状态 -->
      <div class="status-section">
        <div class="status-header">
          <van-icon name="checked" size="50" color="#ff6b35" />
          <div class="status-text">{{ getStatusText(order.status) }}</div>
        </div>
        <div class="status-desc">包裹已发出，等待揽收</div>
      </div>

      <!-- 物流信息 -->
      <div class="logistics-section">
        <div class="section-header">
          <van-icon name="logistics" />
          <span>物流信息</span>
          <span class="more">查看更多 ></span>
        </div>
        <div class="logistics-content">
          <div class="logistics-item">
            <span class="label">{{ order.deliveryCompany || '顺丰速运' }}</span>
            <span class="value">{{ order.deliverySn || 'SF1234567890' }}</span>
            <van-icon name="copy" @click="copyTrackingNumber" />
          </div>
          <div class="logistics-item">
            <span class="label">包裹已发出，等待揽收</span>
            <span class="time">2024-03-15 16:45</span>
          </div>
        </div>
      </div>

      <!-- 收货地址 -->
      <div class="address-section">
        <div class="section-header">
          <van-icon name="location-o" />
          <span>收货地址</span>
        </div>
        <div class="address-content">
          <div class="receiver-info">
            <span class="name">{{ order.receiverName }}</span>
            <span class="phone">{{ order.receiverPhone }}</span>
          </div>
          <div class="address-text">
            {{ order.receiverProvince }} {{ order.receiverCity }} {{ order.receiverRegion }} {{ order.receiverAddress }}
          </div>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="goods-section">
        <div class="section-header">
          <van-icon name="bag-o" />
          <span>商品明细</span>
        </div>
        <div class="goods-list">
          <div class="goods-item" v-for="item in order.orderItems" :key="item.productId">
            <img :src="item.productPic" class="goods-image" />
            <div class="goods-info">
              <div class="goods-name">{{ item.productName }}</div>
              <div class="goods-spec">白色/标准版</div>
              <div class="goods-bottom">
                <span class="price">¥{{ item.productPrice }}</span>
                <span class="quantity">x{{ item.productQuantity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="order-info-section">
        <div class="section-header">
          <van-icon name="info-o" />
          <span>订单信息</span>
        </div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">订单号</span>
            <span class="value">{{ order.orderSn }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间</span>
            <span class="value">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付方式</span>
            <span class="value">{{ getPayTypeText(order.payType) }}</span>
          </div>
        </div>
      </div>

      <!-- 价格信息 -->
      <div class="price-section">
        <div class="price-item">
          <span class="label">商品金额</span>
          <span class="value">¥{{ order.totalAmount }}</span>
        </div>
        <div class="price-item">
          <span class="label">运费</span>
          <span class="value">¥0.00</span>
        </div>
        <div class="price-item total">
          <span class="label">实付款</span>
          <span class="value">¥{{ order.payAmount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getOrder, payOrder, cancelOrder, confirmOrder } from '../api/order'

const router = useRouter()
const route = useRoute()
const order = ref(null)

const statusMap = {
  0: { text: '待付款', icon: 'clock-o' },
  1: { text: '待发货', icon: 'pending-payment' },
  2: { text: '待收货', icon: 'logistics' },
  3: { text: '已完成', icon: 'checked' },
  4: { text: '已关闭', icon: 'close' }
}

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusIcon = (status) => statusMap[status]?.icon || 'question-o'

const getPayTypeText = (payType) => {
  return payType === 1 ? '支付宝' : payType === 2 ? '微信支付' : '未支付'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const onClickLeft = () => {
  router.back()
}

const loadOrder = async () => {
  try {
    const res = await getOrder(route.params.id)
    order.value = res.data
  } catch (error) {
    console.error('获取订单详情失败', error)
    showToast('获取订单详情失败')
  }
}

const handlePay = async () => {
  router.push(`/payment/${order.value._id}`)
}

const handleCancel = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要取消该订单吗？'
    })
    
    await cancelOrder(order.value._id)
    showToast('订单已取消')
    loadOrder()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败', error)
      showToast('取消订单失败')
    }
  }
}

const handleConfirm = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确认已收到货物吗？'
    })
    
    await confirmOrder(order.value._id)
    showToast('确认收货成功')
    loadOrder()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败', error)
      showToast('确认收货失败')
    }
  }
}

const handleRefund = () => {
  router.push(`/refund/apply?orderId=${order.value._id}`)
}

const copyTrackingNumber = async () => {
  try {
    const trackingNumber = order.value.deliverySn || 'SF1234567890'
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(trackingNumber)
      showToast('物流单号已复制')
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = trackingNumber
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      showToast('物流单号已复制')
    }
  } catch (error) {
    console.error('复制失败:', error)
    showToast('复制失败')
  }
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.order-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.content {
  padding-top: 46px;
}

/* 订单状态 */
.status-section {
  background: linear-gradient(135deg, #e63946 0%, #d62828 100%);
  padding: 30px 15px;
  text-align: center;
  color: white;
  margin-bottom: 10px;
}

.status-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.status-text {
  font-size: 18px;
  font-weight: 600;
}

.status-desc {
  font-size: 14px;
  opacity: 0.9;
}

/* 通用section样式 */
.logistics-section,
.address-section,
.goods-section,
.order-info-section,
.price-section {
  background: white;
  margin-bottom: 10px;
  padding: 15px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header :deep(.van-icon) {
  color: #e63946;
  font-size: 18px;
}

.more {
  margin-left: auto;
  font-size: 12px;
  color: #999;
  font-weight: 400;
}

/* 物流信息 */
.logistics-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logistics-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 13px;
}

.logistics-item .label {
  color: #333;
  font-weight: 500;
}

.logistics-item .value {
  color: #666;
  flex: 1;
  text-align: right;
  margin-right: 10px;
}

.logistics-item .time {
  color: #999;
  font-size: 12px;
}

.logistics-item :deep(.van-icon) {
  cursor: pointer;
  color: #ff6b35;
}

/* 收货地址 */
.address-content {
  padding: 10px 0;
}

.receiver-info {
  display: flex;
  gap: 15px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
}

.receiver-info .name {
  color: #333;
}

.receiver-info .phone {
  color: #666;
}

.address-text {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

/* 商品信息 */
.goods-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goods-item {
  display: flex;
  gap: 12px;
  padding: 10px 0;
}

.goods-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  background: #f0f0f0;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.goods-spec {
  font-size: 12px;
  color: #999;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-bottom .price {
  font-size: 14px;
  font-weight: 600;
  color: #e63946;
}

.goods-bottom .quantity {
  font-size: 12px;
  color: #999;
}

/* 订单信息 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
}

.info-item .label {
  color: #666;
}

.info-item .value {
  color: #333;
  font-weight: 500;
}

/* 价格信息 */
.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.price-item:last-child {
  border-bottom: none;
}

.price-item .label {
  color: #666;
}

.price-item .value {
  color: #333;
  font-weight: 500;
}

.price-item.total .label {
  font-weight: 600;
  color: #333;
}

.price-item.total .value {
  font-size: 16px;
  font-weight: 700;
  color: #e63946;
}

/* 操作按钮 */
.action-section {
  padding: 15px;
  display: flex;
  gap: 10px;
}

.action-section :deep(.van-button) {
  flex: 1;
}
</style>
