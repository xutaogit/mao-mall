<template>
  <div class="payment-page">
    <van-nav-bar title="支付订单" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content">
      <!-- 订单信息 -->
      <van-cell-group title="订单信息">
        <van-cell title="订单号" :value="order?.orderSn" />
        <van-cell title="订单金额" :value="`¥${order?.totalAmount.toFixed(2)}`" />
        <van-cell title="订单状态" :value="getOrderStatus(order?.status)" />
      </van-cell-group>

      <!-- 支付信息 -->
      <van-cell-group title="支付信息" v-if="payment">
        <van-cell title="支付单号" :value="payment.paymentSn" />
        <van-cell title="支付金额" :value="`¥${payment.amount.toFixed(2)}`" />
        <van-cell title="支付方式" :value="getPayTypeText(payment.payType)" />
        <van-cell title="支付状态" :value="getPaymentStatus(payment.status)" />
        <van-cell v-if="payment.paymentTime" title="支付时间" :value="formatTime(payment.paymentTime)" />
      </van-cell-group>

      <!-- 支付方式选择 -->
      <van-cell-group title="选择支付方式" v-if="!payment || payment.status === 0">
        <van-radio-group v-model="selectedPayType">
          <van-cell clickable @click="selectedPayType = 1">
            <template #icon>
              <van-radio name="1" />
            </template>
            <template #title>
              <span class="pay-type-label">支付宝</span>
            </template>
          </van-cell>
          <van-cell clickable @click="selectedPayType = 2">
            <template #icon>
              <van-radio name="2" />
            </template>
            <template #title>
              <span class="pay-type-label">微信支付</span>
            </template>
          </van-cell>
        </van-radio-group>
      </van-cell-group>

      <!-- 支付二维码（模拟） -->
      <div class="qrcode-section" v-if="payment && payment.status === 0">
        <div class="qrcode-title">扫描二维码支付</div>
        <div class="qrcode-placeholder">
          <van-icon name="qr" size="60" />
          <div class="qrcode-text">模拟支付二维码</div>
          <div class="qrcode-hint">（开发环境，点击下方按钮模拟支付）</div>
        </div>
      </div>

      <!-- 支付成功提示 -->
      <van-result
        v-if="payment && payment.status === 2"
        type="success"
        title="支付成功"
        description="您的订单已支付，请等待商家发货"
        @click="goToOrderDetail"
      >
        <template #footer>
          <van-button type="primary" block @click="goToOrderDetail">查看订单详情</van-button>
        </template>
      </van-result>

      <!-- 支付失败提示 -->
      <van-result
        v-if="payment && payment.status === 3"
        type="fail"
        title="支付失败"
        description="支付过程中出现问题，请重试"
        @click="retryPayment"
      >
        <template #footer>
          <van-button type="primary" block @click="retryPayment">重新支付</van-button>
        </template>
      </van-result>
    </div>

    <!-- 底部按钮 -->
    <div class="footer" v-if="!payment || (payment && payment.status === 0)">
      <van-button 
        type="primary" 
        block 
        size="large"
        @click="handlePayment"
        :loading="loading"
      >
        {{ payment ? '确认支付' : '创建支付单据' }}
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getOrderDetail } from '../api/order'
import { createPayment, getPaymentDetail, mockPay, getOrderPayment } from '../api/payment'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const order = ref(null)
const payment = ref(null)
const selectedPayType = ref(1) // 默认支付宝

const getOrderStatus = (status) => {
  const statusMap = {
    0: '待付款',
    1: '待发货',
    2: '已发货',
    3: '已完成',
    4: '已关闭'
  }
  return statusMap[status] || '未知'
}

const getPayTypeText = (payType) => {
  return payType === 1 ? '支付宝' : '微信支付'
}

const getPaymentStatus = (status) => {
  const statusMap = {
    0: '待支付',
    1: '支付中',
    2: '已支付',
    3: '支付失败'
  }
  return statusMap[status] || '未知'
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

const loadOrderDetail = async () => {
  try {
    const res = await getOrderDetail(route.params.orderId)
    order.value = res.data
  } catch (error) {
    console.error('获取订单详情失败', error)
    showToast('获取订单详情失败')
  }
}

const loadPaymentDetail = async () => {
  try {
    // 尝试获取该订单的支付单据
    const res = await getOrderPayment(route.params.orderId)
    payment.value = res.data
  } catch (error) {
    // 如果没有支付单据，不显示错误
    console.log('暂无支付单据')
  }
}

const handlePayment = async () => {
  if (!order.value) {
    showToast('订单信息加载失败')
    return
  }

  loading.value = true
  try {
    if (!payment.value) {
      // 创建支付单据
      const res = await createPayment({
        orderId: route.params.orderId,
        payType: selectedPayType.value
      })
      payment.value = res.data
      showToast('支付单据创建成功')
    } else if (payment.value.status === 0) {
      // 模拟支付
      await showConfirmDialog({
        title: '确认支付',
        message: `确认使用${getPayTypeText(payment.value.payType)}支付 ¥${payment.value.amount.toFixed(2)}？`
      })

      const res = await mockPay(payment.value.paymentSn)
      payment.value = res.data.payment
      showToast('支付成功')
    }
  } catch (error) {
    if (error.message !== 'cancel') {
      console.error('支付失败', error)
      showToast(error.response?.data?.message || '支付失败')
    }
  } finally {
    loading.value = false
  }
}

const retryPayment = () => {
  payment.value = null
  selectedPayType.value = 1
}

const goToOrderDetail = () => {
  router.push(`/order/${route.params.orderId}`)
}

const onClickLeft = () => {
  router.back()
}

onMounted(() => {
  loadOrderDetail()
  loadPaymentDetail()
})
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}

.content {
  padding-top: 46px;
  padding-bottom: 20px;
}

.pay-type-label {
  margin-left: 10px;
}

.qrcode-section {
  background: white;
  margin: 15px;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
}

.qrcode-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #323233;
}

.qrcode-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  background: #f7f8fa;
  border-radius: 8px;
  color: #969799;
}

.qrcode-text {
  font-size: 14px;
  margin-top: 10px;
}

.qrcode-hint {
  font-size: 12px;
  color: #c8c9cc;
  margin-top: 5px;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  background: white;
  border-top: 1px solid #ebedf0;
}
</style>
