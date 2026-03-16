<template>
  <div class="orders-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">订单管理</h1>
        <p class="page-subtitle">管理所有订单，处理发货和售后</p>
      </div>
      <el-button @click="handleExport" class="export-btn">
        <el-icon><Download /></el-icon>
        导出订单
      </el-button>
    </div>

    <!-- 状态统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%)">
          <el-icon><ShoppingCart /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">全部订单</div>
          <div class="stat-value">{{ pagination.total }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #ff9c6e 0%, #ff7a45 100%)">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">待发货</div>
          <div class="stat-value">{{ pendingCount }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%)">
          <el-icon><SuccessFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">已完成</div>
          <div class="stat-value">{{ completedCount }}</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-input
        v-model="searchForm.orderSn"
        placeholder="搜索订单号..."
        clearable
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="searchForm.status" placeholder="订单状态" class="filter-select" clearable>
        <el-option label="待付款" :value="0" />
        <el-option label="待发货" :value="1" />
        <el-option label="已发货" :value="2" />
        <el-option label="已完成" :value="3" />
        <el-option label="已关闭" :value="4" />
      </el-select>
      <el-button @click="handleSearch" class="search-btn">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset" class="reset-btn">重置</el-button>
    </div>

    <!-- 订单表格 -->
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        stripe
        class="orders-table"
      >
        <el-table-column prop="orderSn" label="订单号" width="180">
          <template #default="{ row }">
            <span class="order-sn">{{ row.orderSn }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="receiverName" label="收货人" width="100" />
        <el-table-column prop="receiverPhone" label="联系电话" width="130" />
        <el-table-column prop="receiverAddress" label="收货地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180">
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
              v-if="row.status === 1" 
              type="success" 
              link 
              size="small" 
              @click="handleDeliver(row)"
            >
              <el-icon><Promotion /></el-icon>发货
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
        @size-change="loadOrders"
        @current-change="loadOrders"
      />
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="800px" class="detail-dialog">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ orderDetail.orderSn }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(orderDetail.status)" effect="light">
            {{ getStatusText(orderDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ orderDetail.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(orderDetail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ orderDetail.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ orderDetail.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ orderDetail.receiverAddress }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ orderDetail.note || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog v-model="deliverVisible" title="订单发货" width="500px" class="deliver-dialog">
      <el-form :model="deliverForm" label-width="100px">
        <el-form-item label="物流公司">
          <el-input v-model="deliverForm.deliveryCompany" placeholder="请输入物流公司" />
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="deliverForm.deliverySn" placeholder="请输入物流单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deliverVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDeliverSubmit">确定发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, ShoppingCart, Clock, SuccessFilled, Search, View, Promotion } from '@element-plus/icons-vue'
import { getOrders, getOrder, deliverOrder } from '../api/order'

const loading = ref(false)
const tableData = ref([])
const detailVisible = ref(false)
const deliverVisible = ref(false)
const orderDetail = ref({})
const currentOrder = ref(null)

const searchForm = reactive({
  orderSn: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const deliverForm = reactive({
  deliveryCompany: '',
  deliverySn: ''
})

const statusMap = {
  0: { text: '待付款', type: 'warning' },
  1: { text: '待发货', type: 'primary' },
  2: { text: '已发货', type: 'success' },
  3: { text: '已完成', type: 'info' },
  4: { text: '已关闭', type: 'danger' }
}

const pendingCount = computed(() => tableData.value.filter(o => o.status === 1).length)
const completedCount = computed(() => tableData.value.filter(o => o.status === 3).length)

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusType = (status) => statusMap[status]?.type || 'info'

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const loadOrders = async () => {
  loading.value = true
  try {
    const res = await getOrders({
      page: pagination.page,
      pageSize: pagination.pageSize,
      orderSn: searchForm.orderSn,
      status: searchForm.status
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载订单失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadOrders()
}

const handleReset = () => {
  searchForm.orderSn = ''
  searchForm.status = ''
  pagination.page = 1
  loadOrders()
}

const handleView = async (row) => {
  try {
    const res = await getOrder(row._id)
    orderDetail.value = res.data
    detailVisible.value = true
  } catch (error) {
    console.error('获取订单详情失败', error)
  }
}

const handleDeliver = (row) => {
  currentOrder.value = row
  deliverForm.deliveryCompany = ''
  deliverForm.deliverySn = ''
  deliverVisible.value = true
}

const handleDeliverSubmit = async () => {
  try {
    await deliverOrder(currentOrder.value._id, deliverForm)
    ElMessage.success('发货成功')
    deliverVisible.value = false
    loadOrders()
  } catch (error) {
    console.error('发货失败', error)
  }
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-container {
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

.export-btn {
  background-color: #f5f7fa;
  color: #666;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  padding: 10px 24px;
}

.export-btn:hover {
  background-color: #e8eaed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e8eaed;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #0066ff;
  box-shadow: 0 2px 12px rgba(0, 102, 255, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
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

.orders-table {
  border: none;
}

:deep(.orders-table .el-table__header th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: 600;
  border-bottom: 1px solid #e8eaed;
}

:deep(.orders-table .el-table__body tr) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.orders-table .el-table__body tr:hover > td) {
  background-color: #f9fafb;
}

.order-sn {
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

:deep(.deliver-dialog .el-form-item) {
  margin-bottom: 20px;
}
</style>
