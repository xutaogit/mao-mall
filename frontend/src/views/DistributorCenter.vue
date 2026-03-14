<template>
  <div class="distributor-center">
    <van-nav-bar title="分销中心" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content" v-if="centerData">
      <!-- 收益概览 -->
      <div class="earnings-section">
        <div class="earnings-header">
          <div class="total-earnings">
            <div class="label">累计佣金（元）</div>
            <div class="amount">{{ centerData.totalCommission.toFixed(2) }}</div>
          </div>
        </div>
        <div class="earnings-stats">
          <div class="stat-item">
            <div class="stat-value">{{ centerData.todayCommission.toFixed(2) }}</div>
            <div class="stat-label">今日预估</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ centerData.totalOrders }}</div>
            <div class="stat-label">成交订单</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ centerData.totalCustomers }}</div>
            <div class="stat-label">推广人数</div>
          </div>
        </div>
      </div>

      <!-- 推广工具 -->
      <van-cell-group title="推广工具" inset>
        <van-cell title="推广二维码" is-link @click="showQrcode = true">
          <template #icon>
            <van-icon name="qr" class="cell-icon" />
          </template>
        </van-cell>
        <van-cell title="复制推广链接" is-link @click="copyLink">
          <template #icon>
            <van-icon name="link-o" class="cell-icon" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 佣金明细 -->
      <van-cell-group title="佣金明细" inset>
        <van-cell 
          v-for="order in orders" 
          :key="order._id"
          @click="goToOrderDetail(order.orderId._id)"
        >
          <template #title>
            <div class="order-info">
              <div class="product-name">{{ order.productId?.name }}</div>
              <div class="order-time">{{ formatTime(order.createdAt) }}</div>
            </div>
          </template>
          <template #value>
            <div class="order-commission">
              <div class="commission-amount">+¥{{ order.commissionAmount.toFixed(2) }}</div>
              <div class="settlement-status" :class="getStatusClass(order.settlementStatus)">
                {{ getStatusText(order.settlementStatus) }}
              </div>
            </div>
          </template>
        </van-cell>
        <van-cell v-if="orders.length === 0" title="暂无佣金明细" />
      </van-cell-group>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore">
        <van-button size="small" @click="loadMore" :loading="loading">加载更多</van-button>
      </div>
    </div>

    <!-- 推广二维码弹窗 -->
    <van-popup v-model:show="showQrcode" round>
      <div class="qrcode-popup">
        <div class="popup-title">我的推广二维码</div>
        <div class="qrcode-container">
          <div class="qrcode-placeholder">
            <van-icon name="qr" size="120" />
            <div class="qrcode-hint">扫码进入小程序</div>
          </div>
        </div>
        <div class="distributor-code">推广码：{{ centerData?.distributorCode }}</div>
        <van-button type="primary" block @click="showQrcode = false">关闭</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getDistributorCenter, getDistributorOrders } from '../api/distributor'

const router = useRouter()
const centerData = ref(null)
const orders = ref([])
const page = ref(1)
const hasMore = ref(true)
const loading = ref(false)
const showQrcode = ref(false)

const onClickLeft = () => {
  router.back()
}

const loadCenterData = async () => {
  try {
    const res = await getDistributorCenter()
    centerData.value = res.data
  } catch (error) {
    console.error('获取分销中心数据失败', error)
    showToast(error.response?.data?.message || '加载失败')
  }
}

const loadOrders = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const res = await getDistributorOrders({ page: page.value, pageSize: 10 })
    orders.value.push(...res.data.list)
    hasMore.value = page.value < res.data.totalPage
  } catch (error) {
    console.error('获取佣金明细失败', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  page.value++
  loadOrders()
}

const copyLink = () => {
  const link = `${window.location.origin}?share_uid=${centerData.value.distributorCode}`
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(() => {
      showToast('链接已复制')
    }).catch(() => {
      showToast('复制失败，请手动复制')
    })
  } else {
    showToast('您的浏览器不支持自动复制')
  }
}

const getStatusText = (status) => {
  const map = {
    0: '待结算',
    1: '已结算',
    2: '结算失败',
    3: '已取消'
  }
  return map[status] || '未知'
}

const getStatusClass = (status) => {
  return status === 1 ? 'settled' : status === 0 ? 'pending' : 'failed'
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

const goToOrderDetail = (orderId) => {
  router.push(`/order/${orderId}`)
}

onMounted(() => {
  loadCenterData()
  loadOrders()
})
</script>

<style scoped>
.distributor-center {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding-top: 46px;
  padding-bottom: 20px;
}

.earnings-section {
  background: linear-gradient(135deg, #ff6034 0%, #ee0a24 100%);
  padding: 30px 20px;
  color: white;
  margin-bottom: 15px;
}

.earnings-header {
  text-align: center;
  margin-bottom: 30px;
}

.label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.amount {
  font-size: 36px;
  font-weight: 600;
}

.earnings-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
}

.cell-icon {
  margin-right: 10px;
  font-size: 18px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-name {
  font-size: 14px;
  color: #323233;
}

.order-time {
  font-size: 12px;
  color: #969799;
}

.order-commission {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.commission-amount {
  font-size: 16px;
  font-weight: 600;
  color: #ff6034;
}

.settlement-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.settlement-status.settled {
  background: #e8f8f0;
  color: #07c160;
}

.settlement-status.pending {
  background: #fff7e6;
  color: #ff976a;
}

.settlement-status.failed {
  background: #fef0f0;
  color: #ee0a24;
}

.load-more {
  text-align: center;
  padding: 20px;
}

.qrcode-popup {
  padding: 30px;
  text-align: center;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.qrcode-container {
  margin: 20px 0;
}

.qrcode-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 30px;
  background: #f7f8fa;
  border-radius: 8px;
  color: #969799;
}

.qrcode-hint {
  font-size: 14px;
}

.distributor-code {
  font-size: 14px;
  color: #646566;
  margin-bottom: 20px;
}
</style>
