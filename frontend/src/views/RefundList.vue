<template>
  <div class="refund-list">
    <van-nav-bar title="退款/售后" left-arrow @click-left="onClickLeft" fixed />
    
    <van-tabs v-model:active="activeTab" @change="onTabChange" sticky offset-top="46px">
      <van-tab title="全部" name="all" />
      <van-tab title="待审核" name="0" />
      <van-tab title="审核通过" name="1" />
      <van-tab title="审核拒绝" name="2" />
      <van-tab title="已完成" name="3" />
    </van-tabs>

    <div class="content">
      <van-empty v-if="!loading && refunds.length === 0" description="暂无退款记录" />

      <div v-else class="refund-item" v-for="refund in refunds" :key="refund._id" @click="goToDetail(refund._id)">
        <div class="refund-header">
          <span class="refund-sn">退款单号：{{ refund.refundSn }}</span>
          <span class="refund-status">{{ getStatusText(refund.status) }}</span>
        </div>

        <div class="refund-info">
          <div class="info-row">
            <span class="label">退款类型：</span>
            <span class="value">{{ getTypeText(refund.refundType) }}</span>
          </div>
          <div class="info-row">
            <span class="label">退款金额：</span>
            <span class="value amount">¥{{ refund.refundAmount }}</span>
          </div>
          <div class="info-row">
            <span class="label">退款原因：</span>
            <span class="value">{{ refund.reason }}</span>
          </div>
          <div class="info-row">
            <span class="label">申请时间：</span>
            <span class="value">{{ formatDate(refund.createdAt) }}</span>
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
import { getRefunds } from '../api/refund'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('all')
const refunds = ref([])

const statusMap = {
  0: '待审核',
  1: '审核通过',
  2: '审核拒绝',
  3: '已完成'
}

const typeMap = {
  0: '仅退款',
  1: '退货退款',
  2: '换货'
}

const getStatusText = (status) => statusMap[status] || '未知'
const getTypeText = (type) => typeMap[type] || '未知'

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const onClickLeft = () => {
  router.back()
}

const onTabChange = () => {
  loadRefunds()
}

const loadRefunds = async () => {
  loading.value = true
  try {
    const params = {}
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    
    const res = await getRefunds(params)
    refunds.value = res.data.list
  } catch (error) {
    console.error('获取退款列表失败', error)
    showToast('获取退款列表失败')
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/refund/${id}`)
}

onMounted(() => {
  loadRefunds()
})
</script>

<style scoped>
.refund-list {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.content {
  padding-top: 90px;
}

.refund-item {
  background: white;
  margin-bottom: 10px;
  padding: 15px;
  cursor: pointer;
}

.refund-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebedf0;
  margin-bottom: 12px;
}

.refund-sn {
  font-size: 13px;
  color: #646566;
}

.refund-status {
  font-size: 13px;
  color: var(--primary-color);
  font-weight: 600;
}

.refund-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  font-size: 14px;
}

.label {
  color: #969799;
  min-width: 80px;
}

.value {
  color: #323233;
  flex: 1;
}

.amount {
  color: var(--primary-color);
  font-weight: 600;
}
</style>
