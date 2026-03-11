<template>
  <div class="refunds-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>退款管理</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="退款单号">
          <el-input v-model="searchForm.refundSn" placeholder="请输入退款单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="待审核" :value="0" />
            <el-option label="审核通过" :value="1" />
            <el-option label="审核拒绝" :value="2" />
            <el-option label="已完成" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 退款表格 -->
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="refundSn" label="退款单号" width="180" />
        <el-table-column prop="orderId.orderSn" label="订单号" width="180" />
        <el-table-column prop="refundAmount" label="退款金额" width="120">
          <template #default="{ row }">
            ¥{{ row.refundAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="refundType" label="退款类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.refundType === 0" type="info">仅退款</el-tag>
            <el-tag v-else-if="row.refundType === 1" type="warning">退货退款</el-tag>
            <el-tag v-else type="success">换货</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="退款原因" width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === 1" type="success">审核通过</el-tag>
            <el-tag v-else-if="row.status === 2" type="danger">审核拒绝</el-tag>
            <el-tag v-else type="info">已完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 0"
              type="success"
              size="small"
              @click="handleReview(row, 1)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="danger"
              size="small"
              @click="handleReview(row, 2)"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadRefunds"
        @current-change="loadRefunds"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="退款详情" width="600px">
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
          <el-tag v-if="currentRefund.status === 0" type="warning">待审核</el-tag>
          <el-tag v-else-if="currentRefund.status === 1" type="success">审核通过</el-tag>
          <el-tag v-else-if="currentRefund.status === 2" type="danger">审核拒绝</el-tag>
          <el-tag v-else type="info">已完成</el-tag>
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
    <el-dialog v-model="reviewVisible" title="审核退款" width="500px">
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
import { ElMessage, ElMessageBox } from 'element-plus'
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
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.proof-images {
  display: flex;
  flex-wrap: wrap;
}
</style>
