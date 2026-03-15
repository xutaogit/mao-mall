<template>
  <div class="distributors-container">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <!-- 分销员申请 -->
      <el-tab-pane label="分销员申请" name="applications">
        <el-form :inline="true" class="search-form">
          <el-form-item label="状态">
            <el-select v-model="applicationQuery.status" placeholder="全部" style="width: 150px" clearable>
              <el-option label="待审核" :value="0" />
              <el-option label="审核通过" :value="1" />
              <el-option label="审核拒绝" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadApplications">查询</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="applications" border stripe v-loading="loading">
          <el-table-column prop="memberId.username" label="用户名" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="realName" label="真实姓名" />
          <el-table-column label="状态">
            <template #default="{ row }">
              <el-tag v-if="row.status === 0" type="warning">待审核</el-tag>
              <el-tag v-else-if="row.status === 1" type="success">审核通过</el-tag>
              <el-tag v-else-if="row.status === 2" type="danger">审核拒绝</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="distributorCode" label="分销员代码" />
          <el-table-column prop="createdAt" label="申请时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button v-if="row.status === 0" type="success" size="small" @click="handleReview(row, 1)">
                通过
              </el-button>
              <el-button v-if="row.status === 0" type="danger" size="small" @click="handleReview(row, 2)">
                拒绝
              </el-button>
              <el-button v-if="row.status === 1" type="primary" size="small" @click="viewDistributor(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="applicationQuery.page"
          v-model:page-size="applicationQuery.pageSize"
          :total="applicationTotal"
          @current-change="loadApplications"
          layout="total, prev, pager, next"
          style="margin-top: 20px; justify-content: center"
        />
      </el-tab-pane>

      <!-- 分销员列表 -->
      <el-tab-pane label="分销员列表" name="distributors">
        <el-table :data="distributors" border stripe v-loading="loading">
          <el-table-column prop="memberId.username" label="用户名" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="distributorCode" label="分销员代码" />
          <el-table-column prop="totalCommission" label="累计佣金">
            <template #default="{ row }">
              ¥{{ row.totalCommission.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalOrders" label="成交订单" />
          <el-table-column prop="totalCustomers" label="推广人数" />
          <el-table-column prop="createdAt" label="加入时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewOrders(row)">
                查看订单
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="distributorQuery.page"
          v-model:page-size="distributorQuery.pageSize"
          :total="distributorTotal"
          @current-change="loadDistributors"
          layout="total, prev, pager, next"
          style="margin-top: 20px; justify-content: center"
        />
      </el-tab-pane>

      <!-- 商品佣金配置 -->
      <el-tab-pane label="商品佣金配置" name="commissions">
        <el-button type="primary" @click="showBatchDialog" style="margin-bottom: 20px">
          批量设置佣金
        </el-button>

        <el-table :data="commissions" border stripe v-loading="loading">
          <el-table-column prop="productId.name" label="商品名称" />
          <el-table-column prop="skuId" label="SKU ID" width="200">
            <template #default="{ row }">
              {{ row.skuId || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="佣金类型">
            <template #default="{ row }">
              {{ row.commissionType === 0 ? '固定金额' : '百分比' }}
            </template>
          </el-table-column>
          <el-table-column label="佣金值">
            <template #default="{ row }">
              {{ row.commissionType === 0 ? `¥${row.commissionValue}` : `${row.commissionValue}%` }}
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="{ row }">
              <el-tag :type="row.enabled ? 'success' : 'info'">
                {{ row.enabled ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="editCommission(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="deleteCommission(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="commissionQuery.page"
          v-model:page-size="commissionQuery.pageSize"
          :total="commissionTotal"
          @current-change="loadCommissions"
          layout="total, prev, pager, next"
          style="margin-top: 20px; justify-content: center"
        />
      </el-tab-pane>

      <!-- 分销订单 -->
      <el-tab-pane label="分销订单" name="orders">
        <el-form :inline="true" class="search-form">
          <el-form-item label="结算状态">
            <el-select v-model="orderQuery.settlementStatus" placeholder="全部" style="width: 150px" clearable>
              <el-option label="待结算" :value="0" />
              <el-option label="已结算" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadOrders">查询</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="orders" border stripe v-loading="loading">
          <el-table-column prop="distributorId.distributorCode" label="分销员代码" />
          <el-table-column prop="customerId.username" label="客户" />
          <el-table-column prop="orderId.orderSn" label="订单编号" />
          <el-table-column prop="productId.name" label="商品" />
          <el-table-column prop="orderAmount" label="订单金额">
            <template #default="{ row }">
              ¥{{ row.orderAmount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="commissionAmount" label="佣金金额">
            <template #default="{ row }">
              ¥{{ row.commissionAmount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="结算状态">
            <template #default="{ row }">
              <el-tag :type="row.settlementStatus === 0 ? 'warning' : 'success'">
                {{ row.settlementStatus === 0 ? '待结算' : '已结算' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="orderQuery.page"
          v-model:page-size="orderQuery.pageSize"
          :total="orderTotal"
          @current-change="loadOrders"
          layout="total, prev, pager, next"
          style="margin-top: 20px; justify-content: center"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 审核拒绝对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝申请" width="500px">
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
    <el-dialog v-model="commissionDialogVisible" :title="commissionForm.id ? '编辑佣金' : '添加佣金'" width="600px">
      <el-form :model="commissionForm" label-width="100px">
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
    <el-dialog v-model="batchDialogVisible" title="批量设置佣金" width="600px">
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
    // 拒绝
    rejectForm.id = row._id
    rejectForm.rejectReason = ''
    rejectDialogVisible.value = true
  } else {
    // 通过
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
  loadApplications()
})
</script>

<style scoped>
.distributors-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.search-form {
  margin-bottom: 20px;
}
</style>

