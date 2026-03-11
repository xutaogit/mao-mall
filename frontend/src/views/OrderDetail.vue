<template>
  <div class="order-detail">
    <van-nav-bar title="订单详情" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content" v-if="order">
      <!-- 订单状态 -->
      <div class="status-section">
        <van-icon :name="getStatusIcon(order.status)" size="50" />
        <div class="status-text">{{ getStatusText(order.status) }}</div>
      </div>

      <!-- 收货地址 -->
      <van-cell-group class="address-section">
        <van-cell title="收货信息" />
        <van-cell>
          <template #title>
            <div class="address-info">
              <div class="receiver">
                <span class="name">{{ order.receiverName }}</span>
                <span class="phone">{{ order.receiverPhone }}</span>
              </div>
              <div class="address">
                {{ order.receiverProvince }} {{ order.receiverCity }} {{ order.receiverRegion }} {{ order.receiverAddress }}
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 商品信息 -->
      <van-cell-group class="goods-section">
        <van-cell title="商品信息" />
        <div class="goods-list">
          <div class="goods-item" v-for="item in order.orderItems" :key="item.productId">
            <img :src="item.productPic" class="goods-image" />
            <div class="goods-info">
              <div class="goods-name">{{ item.productName }}</div>
              <div class="goods-bottom">
                <span class="price">¥{{ item.productPrice }}</span>
                <span class="quantity">x{{ item.productQuantity }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-cell-group>

      <!-- 订单信息 -->
      <van-cell-group class="order-info-section">
        <van-cell title="订单信息" />
        <van-cell title="订单号" :value="order.orderSn" />
        <van-cell title="创建时间" :value="formatDate(order.createdAt)" />
        <van-cell v-if="order.paymentTime" title="支付时间" :value="formatDate(order.paymentTime)" />
        <van-cell v-if="order.deliveryTime" title="发货时间" :value="formatDate(order.deliveryTime)" />
        <van-cell v-if="order.receiveTime" title="收货时间" :value="formatDate(order.receiveTime)" />
        <van-cell v-if="order.deliveryCompany" title="物流公司" :value="order.deliveryCompany" />
        <van-cell v-if="order.deliverySn" title="物流单号" :value="order.deliverySn" />
        <van-cell v-if="order.note" title="订单备注" :value="order.note" />
      </van-cell-group>

      <!-- 价格信息 -->
      <van-cell-group class="price-section">
        <van-cell title="商品金额" :value="`¥${order.totalAmount}`" />
        <van-cell title="运费" value="¥0.00" />
        <van-cell title="实付款" :value="`¥${order.payAmount}`" value-class="total-price" />
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-section">
        <van-button v-if="order.status === 0" block @click="handleCancel">取消订单</van-button>
        <van-button v-if="order.status === 0" block type="primary" @click="handlePay">去支付</van-button>
        <van-button v-if="order.status === 1" block @click="handleRefund">申请退款</van-button>
        <van-button v-if="order.status === 2" block type="primary" @click="handleConfirm">确认收货</van-button>
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
  try {
    await payOrder(order.value._id)
    showToast('支付成功')
    loadOrder()
  } catch (error) {
    console.error('支付失败', error)
    showToast(error.response?.data?.message || '支付失败')
  }
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

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.order-detail {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.content {
  padding-top: 46px;
}

.status-section {
  background: white;
  padding: 30px;
  text-align: center;
  margin-bottom: 10px;
}

.status-text {
  margin-top: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.address-section,
.goods-section,
.order-info-section,
.price-section {
  margin-bottom: 10px;
}

.address-info {
  padding: 10px 0;
}

.receiver {
  display: flex;
  gap: 15px;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 600;
}

.address {
  font-size: 14px;
  color: #646566;
  line-height: 1.6;
}

.goods-list {
  padding: 15px;
}

.goods-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.goods-item:last-child {
  margin-bottom: 0;
}

.goods-image {
  width: 70px;
  height: 70px;
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
  font-size: 14px;
  color: #323233;
}

.quantity {
  font-size: 13px;
  color: #969799;
}

.total-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

.action-section {
  padding: 15px;
  display: flex;
  gap: 10px;
}
</style>
