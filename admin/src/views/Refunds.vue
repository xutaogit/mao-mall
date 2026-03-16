<template>
  <div class="refunds-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">退款管理</h1>
        <p class="page-subtitle">处理用户退款申请和售后</p>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-input
        v-model="searchForm.refundSn"
        placeholder="搜索退款单号..."
        clearable
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="searchForm.status" placeholder="退款状态" class="filter-select" clearable>
        <el-option label="待审核" :value="0" />
        <el-option label="审核通过" :value="1" />
        <el-option label="审核拒绝" :value="2" />
        <el-option label="已完成" :value="3" />
      </el-select>
      <el-button @click="handleSearch" class="search-btn">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset" class="reset-btn">重置</el-button>
    </div>

    <!-- 退款表格 -->
    <div class="table-wrapper">
      <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe class="refunds-table">
        <el-table-column prop="refundSn" label="退款单号" width="180">
          <template #default="{ row }">
            <span class="refund-sn">{{ row.refundSn }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderId.orderSn" label="订单号" width="180" />
        <el-table-column prop="refundAmount" label="退款金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.refundAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundType" label="退款类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.refundType === 0" type="info" effect="light">仅退款</el-tag>
            <el-tag v-else-if="row.refundType === 1" type="warning" effect="light">退货退款</el-tag>
            <el-tag v-else type="success" effect="light">换货</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="退款原因" width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="warning" effect="light">待审核</el-tag>
            <el-tag v-else-if="row.status === 1" type="success" effect="light">审核通过</el-tag>
            <el-tag v-else-if="row.status === 2" type="danger" effect="light">审核拒绝</el-tag>
            <el-tag v-else type="info" effect="light">已完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              <el-icon><View /></el-icon>查看
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="success"
              link
              size="small"
              @click="handleReview(row, 1)"
            >
              <el-icon><SuccessFilled /></el-icon>通过
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="danger"
              link
              size="small"
              @click="handleReview(row, 2)"
            >
              <el-icon><Close /></el-icon>拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadRefunds"
        @current-change="loadRefunds"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="退款详情" width="600px" class="detail-dialog">
      <el-descriptions :column="1" border v-if="currentRefund">
        <el-descriptions-item label="退款单号">{{ currentRefund.refundSn }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ currentRefund.orderId?.orderSn }}</el-descriptions-item>
        <el-descriptions-item label="退款金额">¥{{ currentRefund.refundAmount }}</el-descriptions-item>
        <el-descriptions-item label="退款类型">
          {{ getRefundTypeText(currentRefund.refundType) }}
        </el-descriptions-item>
        <el-descriptions-item label="退款原因">{{ currentRefund.reason }}</el-descriptions-item>
        <el-descriptions-item label="问题描述">{{ currentRefund.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="凭证图片">
          <div v-if="currentRefund.proofPics && currentRefund.proofPics.length > 0" class="proof-images">
            <el-image
              v-for="(pic, index) in currentRefund.proofPics"
              :key="index"
              :src="pic"
              :preview-src-list="currentRefund.proofPics"
              style="width: 80px; height: 80px; margin-right: 10px"
              fit="cover"
            />
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="currentRefund.status === 0" type="warning" effect="light">待审核</el-tag>
          <el-tag v-else-if="currentRefund.status === 1" type="success" effect="light">审核通过</el-tag>
          <el-tag v-else-if="currentRefund.status === 2" type="danger" effect="light">审核拒绝</el-tag>
          <el-tag v-else type="info" effect="light">已完成</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理备注" v-if="currentRefund.handleNote">
          {{ currentRefund.handleNote }}
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ formatDate(currentRefund.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="处理时间" v-if="currentRefund.handleTime">
          {{ formatDate(currentRefund.handleTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="reviewVisible" title="审核退款" width="500px" class="review-dialog">
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="reviewForm.status">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input
            v-model="reviewForm.handleNote"
            type="textarea"
            :rows="3"
            placeholder="请输入处理备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReviewSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, View, SuccessFilled, Close } from '@element-plus/icons-vue'
import { getRefunds, reviewRefund } from '../api/refund'

const loading = ref(false)
const tableData = ref([])
const detailVisible = ref(false)
const reviewVisible = ref(false)
const currentRefund = ref(null)

const searchForm = reactive({
  refundSn: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const reviewForm = reactive({
  status: 1,
  handleNote: ''
})

const loadRefunds = async () => {
  loading.value = true
  try {
    const res = await getRefunds({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载退款列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadRefunds()
}

const handleReset = () => {
  searchForm.refundSn = ''
  searchForm.status = ''
  pagination.page = 1
  loadRefunds()
}

const handleView = (row) => {
  currentRefund.value = row
  detailVisible.value = true
}

const handleReview = (row, status) => {
  currentRefund.value = row
  reviewForm.status = status
  reviewForm.handleNote = ''
  reviewVisible.value = true
}

const handleReviewSubmit = async () => {
  try {
    await reviewRefund(currentRefund.value._id, reviewForm)
    ElMessage.success('审核成功')
    reviewVisible.value = false
    loadRefunds()
  } catch (error) {
    console.error('审核失败', error)
    ElMessage.error('审核失败')
  }
}

const getRefundTypeText = (type) => {
  const map = { 0: '仅退款', 1: '退货退款', 2: '换货' }
  return map[type] || '-'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadRefunds()
})
</script>

<style scoped>
.refunds-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.search-section {
  display: flex;
  gap: 12px;
  align-items: center;
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e8eaed;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

:deep(.search-input .el-input__wrapper) {
  background-color: #f5f7fa;
  border: 1px solid #e8eaed;
}

.filter-select {
  width: 140px;
}

:deep(.filter-select .el-input__wrapper) {
  background-color: #f5f7fa;
  border: 1px solid #e8eaed;
}

.search-btn {
  background-color: #0066ff;
  color: #fff;
  border: none;
  border-radius: 6px;
}

.search-btn:hover {
  background-color: #0052cc;
}

.reset-btn {
  background-color: #f5f7fa;
  color: #666;
  border: 1px solid #e8eaed;
  border-radius: 6px;
}

.reset-btn:hover {
  background-color: #e8eaed;
}

.table-wrapper {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e8eaed;
  overflow: hidden;
}

.refunds-table {
  border: none;
}

:deep(.refunds-table .el-table__header th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: 600;
  border-bottom: 1px solid #e8eaed;
}

:deep(.refunds-table .el-table__body tr) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.refunds-table .el-table__body tr:hover > td) {
  background-color: #f9fafb;
}

.refund-sn {
  font-weight: 500;
  color: #0066ff;
}

.amount {
  font-weight: 600;
  color: #ff6b35;
  font-size: 15px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e8eaed;
}

:deep(.el-pagination) {
  gap: 8px;
}

:deep(.el-pagination .btn-prev,
.el-pagination .btn-next,
.el-pagination .el-pager li) {
  border-radius: 4px;
  border: 1px solid #e8eaed;
}

:deep(.el-pagination .btn-prev:hover,
.el-pagination .btn-next:hover,
.el-pagination .el-pager li:hover) {
  color: #0066ff;
  border-color: #0066ff;
}

:deep(.el-pagination .el-pager li.active) {
  color: #fff;
  background-color: #0066ff;
  border-color: #0066ff;
}

:deep(.detail-dialog .el-descriptions__item) {
  padding: 12px 16px;
}

:deep(.review-dialog .el-form-item) {
  margin-bottom: 20px;
}

.proof-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
