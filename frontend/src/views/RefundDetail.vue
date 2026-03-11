<template>
  <div class="refund-detail">
    <van-nav-bar title="退款详情" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content" v-if="refund">
      <!-- 退款状态 -->
      <div class="status-section">
        <van-icon :name="getStatusIcon(refund.status)" size="50" />
        <div class="status-text">{{ getStatusText(refund.status) }}</div>
        <div class="status-desc" v-if="refund.handleNote">{{ refund.handleNote }}</div>
      </div>

      <!-- 退款信息 -->
      <van-cell-group class="refund-info-section">
        <van-cell title="退款信息" />
        <van-cell title="退款单号" :value="refund.refundSn" />
        <van-cell title="退款类型" :value="getTypeText(refund.refundType)" />
        <van-cell title="退款金额" :value="`¥${refund.refundAmount}`" value-class="amount" />
        <van-cell title="退款原因" :value="refund.reason" />
        <van-cell v-if="refund.description" title="问题描述" :value="refund.description" />
      </van-cell-group>

      <!-- 凭证图片 -->
      <van-cell-group v-if="refund.proofPics && refund.proofPics.length > 0" class="proof-section">
        <van-cell title="凭证图片" />
        <div class="proof-images">
          <van-image
            v-for="(pic, index) in refund.proofPics"
            :key="index"
            :src="pic"
            width="80"
            height="80"
            fit="cover"
            @click="previewImage(index)"
          />
        </div>
      </van-cell-group>

      <!-- 订单信息 -->
      <van-cell-group class="order-info-section" v-if="refund.orderId">
        <van-cell title="关联订单" is-link @click="goToOrder" />
      </van-cell-group>

      <!-- 时间信息 -->
      <van-cell-group class="time-section">
        <van-cell title="时间信息" />
        <van-cell title="申请时间" :value="formatDate(refund.createdAt)" />
        <van-cell v-if="refund.handleTime" title="处理时间" :value="formatDate(refund.handleTime)" />
        <van-cell v-if="refund.refundTime" title="退款时间" :value="formatDate(refund.refundTime)" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import { getRefund } from '../api/refund'

const router = useRouter()
const route = useRoute()
const refund = ref(null)

const statusMap = {
  0: { text: '待审核', icon: 'clock-o' },
  1: { text: '审核通过', icon: 'checked' },
  2: { text: '审核拒绝', icon: 'close' },
  3: { text: '已完成', icon: 'success' }
}

const typeMap = {
  0: '仅退款',
  1: '退货退款',
  2: '换货'
}

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusIcon = (status) => statusMap[status]?.icon || 'question-o'
const getTypeText = (type) => typeMap[type] || '未知'

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const onClickLeft = () => {
  router.back()
}

const loadRefund = async () => {
  try {
    const res = await getRefund(route.params.id)
    refund.value = res.data
  } catch (error) {
    console.error('获取退款详情失败', error)
    showToast('获取退款详情失败')
  }
}

const previewImage = (index) => {
  showImagePreview({
    images: refund.value.proofPics,
    startPosition: index
  })
}

const goToOrder = () => {
  router.push(`/order/${refund.value.orderId}`)
}

onMounted(() => {
  loadRefund()
})
</script>

<style scoped>
.refund-detail {
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

.status-desc {
  margin-top: 8px;
  font-size: 14px;
  color: #969799;
}

.refund-info-section,
.proof-section,
.order-info-section,
.time-section {
  margin-bottom: 10px;
}

.amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

.proof-images {
  padding: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
