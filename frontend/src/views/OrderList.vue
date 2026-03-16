<template>
  <div class="order-list">
    <van-nav-bar title="我的订单" left-arrow @click-left="onClickLeft" fixed />
    
    <van-tabs v-model:active="activeTab" @change="onTabChange" sticky offset-top="46px">
      <van-tab title="全部" name="all" />
      <van-tab title="待付款" name="0" />
      <van-tab title="待发货" name="1" />
      <van-tab title="待收货" name="2" />
      <van-tab title="已完成" name="3" />
    </van-tabs>

    <div class="content">
      <van-empty v-if="!loading && orders.length === 0" description="暂无订单" />

      <div v-else class="order-item" v-for="order in orders" :key="order._id" @click="goToDetail(order._id)">
        <div class="order-header">
          <span class="order-sn">订单号：{{ order.orderSn }}</span>
          <span class="order-status">{{ getStatusText(order.status) }}</span>
        </div>

        <div class="order-goods">
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

        <div class="order-footer">
          <div class="total-amount">
            合计：<span class="amount">¥{{ order.totalAmount }}</span>
          </div>
          <div class="order-actions">
            <van-button v-if="order.status === 0" size="small" @click.stop="handleCancel(order._id)">取消订单</van-button>
            <van-button v-if="order.status === 0" size="small" type="primary" @click.stop="handlePay(order._id)">去支付</van-button>
            <van-button v-if="order.status === 1" size="small" @click.stop="handleRefund(order._id)">申请退款</van-button>
            <van-button v-if="order.status === 2" size="small" type="primary" @click.stop="handleConfirm(order._id)">确认收货</van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getOrders, payOrder, cancelOrder, confirmOrder } from '../api/order'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('all')
const orders = ref([])

const statusMap = {
  0: '待付款',
  1: '待发货',
  2: '待收货',
  3: '已完成',
  4: '已关闭'
}

const getStatusText = (status) => statusMap[status] || '未知'

const onClickLeft = () => {
  router.back()
}

const onTabChange = () => {
  loadOrders()
}

const loadOrders = async () => {
  loading.value = true
  try {
    const params = {}
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    
    const res = await getOrders(params)
    orders.value = res.data.list
  } catch (error) {
    console.error('获取订单列表失败', error)
    showToast('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/order/${id}`)
}

const handlePay = async (id) => {
  try {
    await payOrder(id)
    showToast('支付成功')
    loadOrders()
  } catch (error) {
    console.error('支付失败', error)
    showToast(error.response?.data?.message || '支付失败')
  }
}

const handleCancel = async (id) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要取消该订单吗？'
    })
    
    await cancelOrder(id)
    showToast('订单已取消')
    loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败', error)
      showToast('取消订单失败')
    }
  }
}

const handleConfirm = async (id) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确认已收到货物吗？'
    })
    
    await confirmOrder(id)
    showToast('确认收货成功')
    loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败', error)
      showToast('确认收货失败')
    }
  }
}

const handleRefund = (id) => {
  router.push(`/refund/apply?orderId=${id}`)
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-list {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.content {
  padding-top: 90px;
}

.order-item {
  background: white;
  margin: 10px;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-item:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.order-sn {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.order-status {
  font-size: 13px;
  color: #e63946;
  font-weight: 600;
}

.order-goods {
  padding: 12px 15px;
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
  background: #f0f0f0;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 14px;
  font-weight: 600;
  color: #e63946;
}

.quantity {
  font-size: 12px;
  color: #999;
}

.order-footer {
  padding: 12px 15px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

.total-amount {
  font-size: 13px;
  color: #666;
}

.amount {
  font-size: 15px;
  font-weight: 700;
  color: #e63946;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.order-actions :deep(.van-button) {
  font-size: 12px;
  height: 28px;
  padding: 0 12px;
}

.order-actions :deep(.van-button--primary) {
  background: #e63946;
  border: none;
}

/* Tabs样式 */
:deep(.van-tabs) {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.van-tabs__nav) {
  background: white;
}

:deep(.van-tab) {
  color: #666;
  font-weight: 500;
}

:deep(.van-tab--active) {
  color: #e63946;
}

:deep(.van-tabs__line) {
  background: #e63946;
}
</style>
