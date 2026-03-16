<template>
  <div class="distributors-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">分销管理</h1>
        <p class="page-subtitle">管理分销员、佣金配置和分销订单</p>
      </div>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="tabs-wrapper">
      <!-- 分销员申请 -->
      <el-tab-pane label="分销员申请" name="applications">
        <div class="search-section">
          <el-select v-model="applicationQuery.status" placeholder="申请状态" class="filter-select" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="审核通过" :value="1" />
            <el-option label="审核拒绝" :value="2" />
          </el-select>
          <el-button @click="loadApplications" class="search-btn">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="applications" style="width: 100%" v-loading="loading" stripe class="data-table">
            <el-table-column prop="memberId.username" label="用户名" width="120" />
            <el-table-column prop="phone" label="手机号" width="130" />
            <el-table-column prop="realName" label="真实姓名" width="120" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.status === 0" type="warning" effect="light">待审核</el-tag>
                <el-tag v-else-if="row.status === 1" type="success" effect="light">审核通过</el-tag>
                <el-tag v-else-if="row.status === 2" type="danger" effect="light">审核拒绝</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="distributorCode" label="分销员代码" width="140" />
            <el-table-column prop="createdAt" label="申请时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button v-if="row.status === 0" type="success" link size="small" @click="handleReview(row, 1)">
                  <el-icon><SuccessFilled /></el-icon>通过
                </el-button>
                <el-button v-if="row.status === 0" type="danger" link size="small" @click="handleReview(row, 2)">
                  <el-icon><Close /></el-icon>拒绝
                </el-button>
                <el-button v-if="row.status === 1" type="primary" link size="small" @click="viewDistributor(row)">
                  <el-icon><View /></el-icon>详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="applicationQuery.page"
            v-model:page-size="applicationQuery.pageSize"
            :total="applicationTotal"
            @current-change="loadApplications"
            layout="total, prev, pager, next"
          />
        </div>
      </el-tab-pane>

      <!-- 分销员列表 -->
      <el-tab-pane label="分销员列表" name="distributors">
        <div class="table-wrapper">
          <el-table :data="distributors" style="width: 100%" v-loading="loading" stripe class="data-table">
            <el-table-column prop="memberId.username" label="用户名" width="120" />
            <el-table-column prop="phone" label="手机号" width="130" />
            <el-table-column prop="distributorCode" label="分销员代码" width="140" />
            <el-table-column prop="totalCommission" label="累计佣金" width="120">
              <template #default="{ row }">
                <span class="amount">¥{{ row.totalCommission.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalOrders" label="成交订单" width="100" />
            <el-table-column prop="totalCustomers" label="推广人数" width="100" />
            <el-table-column prop="createdAt" label="加入时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewOrders(row)">
                  <el-icon><DocumentCopy /></el-icon>订单
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="distributorQuery.page"
            v-model:page-size="distributorQuery.pageSize"
            :total="distributorTotal"
            @current-change="loadDistributors"
            layout="total, prev, pager, next"
          />
        </div>
      </el-tab-pane>

      <!-- 商品佣金配置 -->
      <el-tab-pane label="商品佣金配置" name="commissions">
        <div class="commission-header">
          <el-button type="primary" @click="showBatchDialog">
            <el-icon><Plus /></el-icon>
            批量设置佣金
          </el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="commissions" style="width: 100%" v-loading="loading" stripe class="data-table">
            <el-table-column prop="productId.name" label="商品名称" min-width="180" />
            <el-table-column prop="skuId" label="SKU ID" width="180">
              <template #default="{ row }">
                {{ row.skuId || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="佣金类型" width="110">
              <template #default="{ row }">
                <el-tag :type="row.commissionType === 0 ? 'info' : 'warning'" effect="light">
                  {{ row.commissionType === 0 ? '固定金额' : '百分比' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="佣金值" width="120">
              <template #default="{ row }">
                <span class="commission-value">
                  {{ row.commissionType === 0 ? `¥${row.commissionValue}` : `${row.commissionValue}%` }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.enabled ? 'success' : 'info'" effect="light">
                  {{ row.enabled ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="editCommission(row)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button type="danger" link size="small" @click="deleteCommission(row)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="commissionQuery.page"
            v-model:page-size="commissionQuery.pageSize"
            :total="commissionTotal"
            @current-change="loadCommissions"
            layout="total, prev, pager, next"
          />
        </div>
      </el-tab-pane>

      <!-- 分销订单 -->
      <el-tab-pane label="分销订单" name="orders">
        <div class="search-section">
          <el-select v-model="orderQuery.settlementStatus" placeholder="结算状态" class="filter-select" clearable>
            <el-option label="待结算" :value="0" />
            <el-option label="已结算" :value="1" />
          </el-select>
          <el-button @click="loadOrders" class="search-btn">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="orders" style="width: 100%" v-loading="loading" stripe class="data-table">
            <el-table-column prop="distributorId.distributorCode" label="分销员代码" width="140" />
            <el-table-column prop="customerId.username" label="客户" width="120" />
            <el-table-column prop="orderId.orderSn" label="订单编号" width="160" />
            <el-table-column prop="productId.name" label="商品" min-width="150" />
            <el-table-column prop="orderAmount" label="订单金额" width="120">
              <template #default="{ row }">
                <span class="amount">¥{{ row.orderAmount.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="commissionAmount" label="佣金金额" width="120">
              <template #default="{ row }">
                <span class="commission-amount">¥{{ row.commissionAmount.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="结算状态" width="110">
              <template #default="{ row }">
                <el-tag :type="row.settlementStatus === 0 ? 'warning' : 'success'" effect="light">
                  {{ row.settlementStatus === 0 ? '待结算' : '已结算' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="orderQuery.page"
            v-model:page-size="orderQuery.pageSize"
            :total="orderTotal"
            @current-change="loadOrders"
            layout="total, prev, pager, next"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 审核拒绝对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝申请" width="500px" class="reject-dialog">
      <el-form :model="rejectForm">
        <el-form-item label="拒绝原因">
          <el-input v-model="rejectForm.rejectReason" type="textarea" :rows="4" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑佣金对话框 -->
    <el-dialog v-model="commissionDialogVisible" :title="commissionForm.id ? '编辑佣金' : '添加佣金'" width="600px" class="commission-dialog">
      <el-form :model="commissionForm" label-width="120px">
        <el-form-item label="商品ID">
          <el-input v-model="commissionForm.productId" placeholder="请输入商品ID" />
        </el-form-item>
        <el-form-item label="SKU ID">
          <el-input v-model="commissionForm.skuId" placeholder="留空则对整个商品生效" />
        </el-form-item>
        <el-form-item label="佣金类型">
          <el-radio-group v-model="commissionForm.commissionType">
            <el-radio :label="0">固定金额</el-radio>
            <el-radio :label="1">百分比</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="commissionForm.commissionType === 0 ? '佣金金额（元）' : '佣金比例（%）'">
          <el-input-number v-model="commissionForm.commissionValue" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="commissionForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="commissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCommission">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量设置佣金对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量设置佣金" width="600px" class="batch-dialog">
      <el-form :model="batchForm" label-width="120px">
        <el-form-item label="商品ID列表">
          <el-input 
            v-model="batchForm.productIdsText" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入商品ID，每行一个"
          />
          <div style="color: #999; font-size: 12px; margin-top: 5px">
            提示：每行输入一个商品ID，支持批量设置
          </div>
        </el-form-item>
        <el-form-item label="佣金类型">
          <el-radio-group v-model="batchForm.commissionType">
            <el-radio :label="0">固定金额</el-radio>
            <el-radio :label="1">百分比</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="batchForm.commissionType === 0 ? '佣金金额（元）' : '佣金比例（%）'">
          <el-input-number v-model="batchForm.commissionValue" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="batchForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBatchCommission">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, SuccessFilled, Close, View, DocumentCopy, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getApplications, reviewApplication, getDistributors, getCommissions, setCommission, batchSetCommission, deleteCommission as deleteCommissionApi, getDistributionOrders } from '../api/distributor'

const activeTab = ref('applications')
const loading = ref(false)

// 分销员申请
const applications = ref([])
const applicationTotal = ref(0)
const applicationQuery = reactive({
  page: 1,
  pageSize: 10,
  status: undefined
})

// 分销员列表
const distributors = ref([])
const distributorTotal = ref(0)
const distributorQuery = reactive({
  page: 1,
  pageSize: 10
})

// 商品佣金配置
const commissions = ref([])
const commissionTotal = ref(0)
const commissionQuery = reactive({
  page: 1,
  pageSize: 10
})

// 分销订单
const orders = ref([])
const orderTotal = ref(0)
const orderQuery = reactive({
  page: 1,
  pageSize: 10,
  settlementStatus: undefined
})

// 拒绝对话框
const rejectDialogVisible = ref(false)
const rejectForm = reactive({
  id: '',
  rejectReason: ''
})

// 编辑佣金对话框
const commissionDialogVisible = ref(false)
const commissionForm = reactive({
  id: '',
  productId: '',
  skuId: '',
  commissionType: 1,
  commissionValue: 0,
  enabled: true
})

// 批量设置佣金对话框
const batchDialogVisible = ref(false)
const batchForm = reactive({
  productIdsText: '',
  commissionType: 1,
  commissionValue: 0,
  enabled: true
})

// 加载分销员申请
const loadApplications = async () => {
  try {
    loading.value = true
    const res = await getApplications(applicationQuery)
    applications.value = res.data.list
    applicationTotal.value = res.data.total
  } catch (error) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 加载分销员列表
const loadDistributors = async () => {
  try {
    loading.value = true
    const res = await getDistributors(distributorQuery)
    distributors.value = res.data.list
    distributorTotal.value = res.data.total
  } catch (error) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 加载商品佣金配置
const loadCommissions = async () => {
  try {
    loading.value = true
    const res = await getCommissions(commissionQuery)
    commissions.value = res.data.list
    commissionTotal.value = res.data.total
  } catch (error) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 加载分销订单
const loadOrders = async () => {
  try {
    loading.value = true
    const res = await getDistributionOrders(orderQuery)
    orders.value = res.data.list
    orderTotal.value = res.data.total
  } catch (error) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 审核申请
const handleReview = async (row, status) => {
  if (status === 2) {
    rejectForm.id = row._id
    rejectForm.rejectReason = ''
    rejectDialogVisible.value = true
  } else {
    try {
      await ElMessageBox.confirm('确定通过该申请吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await reviewApplication(row._id, { status: 1 })
      ElMessage.success('审核成功')
      loadApplications()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '审核失败')
      }
    }
  }
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectForm.rejectReason) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  try {
    await reviewApplication(rejectForm.id, {
      status: 2,
      rejectReason: rejectForm.rejectReason
    })
    ElMessage.success('已拒绝')
    rejectDialogVisible.value = false
    loadApplications()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 删除佣金配置
const deleteCommission = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该佣金配置吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteCommissionApi(row._id)
    ElMessage.success('删除成功')
    loadCommissions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 切换标签页
const handleTabClick = () => {
  switch (activeTab.value) {
    case 'applications':
      loadApplications()
      break
    case 'distributors':
      loadDistributors()
      break
    case 'commissions':
      loadCommissions()
      break
    case 'orders':
      loadOrders()
      break
  }
}

// 监听标签页变化
watch(activeTab, () => {
  handleTabClick()
})

// 查看分销员详情
const viewDistributor = (row) => {
  ElMessage.info('查看详情功能待开发')
}

// 查看订单
const viewOrders = (row) => {
  orderQuery.distributorId = row._id
  activeTab.value = 'orders'
  loadOrders()
}

// 编辑佣金
const editCommission = (row) => {
  commissionForm.id = row._id
  commissionForm.productId = row.productId._id || row.productId
  commissionForm.skuId = row.skuId?._id || row.skuId || ''
  commissionForm.commissionType = row.commissionType
  commissionForm.commissionValue = row.commissionValue
  commissionForm.enabled = row.enabled
  commissionDialogVisible.value = true
}

// 保存佣金配置
const saveCommission = async () => {
  if (!commissionForm.productId) {
    ElMessage.warning('请输入商品ID')
    return
  }
  if (commissionForm.commissionValue <= 0) {
    ElMessage.warning('请输入有效的佣金值')
    return
  }
  
  try {
    await setCommission({
      productId: commissionForm.productId,
      skuId: commissionForm.skuId || undefined,
      commissionType: commissionForm.commissionType,
      commissionValue: commissionForm.commissionValue,
      enabled: commissionForm.enabled
    })
    ElMessage.success('保存成功')
    commissionDialogVisible.value = false
    loadCommissions()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  }
}

// 批量设置佣金
const showBatchDialog = () => {
  batchForm.productIdsText = ''
  batchForm.commissionType = 1
  batchForm.commissionValue = 0
  batchForm.enabled = true
  batchDialogVisible.value = true
}

// 保存批量佣金配置
const saveBatchCommission = async () => {
  const productIds = batchForm.productIdsText
    .split('\n')
    .map(id => id.trim())
    .filter(id => id)
  
  if (productIds.length === 0) {
    ElMessage.warning('请输入商品ID')
    return
  }
  if (batchForm.commissionValue <= 0) {
    ElMessage.warning('请输入有效的佣金值')
    return
  }
  
  try {
    await batchSetCommission({
      productIds,
      commissionType: batchForm.commissionType,
      commissionValue: batchForm.commissionValue,
      enabled: batchForm.enabled
    })
    ElMessage.success(`批量设置成功，共 ${productIds.length} 个商品`)
    batchDialogVisible.value = false
    loadCommissions()
  } catch (error) {
    ElMessage.error(error.message || '批量设置失败')
  }
}

onMounted(() => {
  // 初始加载时根据当前标签页加载数据
  handleTabClick()
})
</script>

<style scoped>
.distributors-container {
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

.tabs-wrapper {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e8eaed;
  padding: 0;
}

:deep(.tabs-wrapper .el-tabs__header) {
  border-bottom: 1px solid #e8eaed;
  margin: 0;
}

:deep(.tabs-wrapper .el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.tabs-wrapper .el-tabs__content) {
  padding: 24px;
}

.search-section {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
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

.commission-header {
  margin-bottom: 16px;
}

.table-wrapper {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e8eaed;
  overflow: hidden;
  margin-bottom: 16px;
}

.data-table {
  border: none;
}

:deep(.data-table .el-table__header th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: 600;
  border-bottom: 1px solid #e8eaed;
}

:deep(.data-table .el-table__body tr) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.data-table .el-table__body tr:hover > td) {
  background-color: #f9fafb;
}

.amount {
  font-weight: 600;
  color: #ff6b35;
  font-size: 15px;
}

.commission-amount {
  font-weight: 600;
  color: #52c41a;
  font-size: 15px;
}

.commission-value {
  font-weight: 600;
  color: #0066ff;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
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

:deep(.reject-dialog .el-form-item,
.commission-dialog .el-form-item,
.batch-dialog .el-form-item) {
  margin-bottom: 20px;
}

:deep(.reject-dialog .el-dialog__body,
.commission-dialog .el-dialog__body,
.batch-dialog .el-dialog__body) {
  padding: 24px;
}
</style>
