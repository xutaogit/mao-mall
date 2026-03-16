<template>
  <div class="coupons-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">优惠券管理</h1>
        <p class="page-subtitle">创建和管理营销活动优惠券</p>
      </div>
      <el-button type="primary" size="large" @click="handleAdd" class="add-btn">
        <el-icon><Plus /></el-icon>
        新增优惠券
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-input
        v-model="searchForm.name"
        placeholder="搜索优惠券名称..."
        clearable
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="searchForm.type" placeholder="优惠券类型" class="filter-select" clearable>
        <el-option label="满减券" :value="0" />
        <el-option label="折扣券" :value="1" />
        <el-option label="无门槛券" :value="2" />
      </el-select>
      <el-button @click="handleSearch" class="search-btn">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset" class="reset-btn">重置</el-button>
    </div>

    <!-- 优惠券表格 -->
    <div class="table-wrapper">
      <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe class="coupons-table">
        <el-table-column prop="name" label="优惠券名称" min-width="180">
          <template #default="{ row }">
            <div class="coupon-name">{{ row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.type === 0" type="danger" effect="light">满减券</el-tag>
            <el-tag v-else-if="row.type === 1" type="warning" effect="light">折扣券</el-tag>
            <el-tag v-else type="success" effect="light">无门槛券</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="优惠额度" width="120">
          <template #default="{ row }">
            <span class="amount" v-if="row.type === 1">{{ (row.amount * 10).toFixed(1) }}折</span>
            <span class="amount" v-else>¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="minPoint" label="使用门槛" width="120">
          <template #default="{ row }">
            <span v-if="row.minPoint > 0">满¥{{ row.minPoint }}</span>
            <span v-else class="no-threshold">无门槛</span>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="发放数量" width="100" />
        <el-table-column prop="receiveCount" label="已领取" width="100" />
        <el-table-column prop="useCount" label="已使用" width="100" />
        <el-table-column label="有效期" width="180">
          <template #default="{ row }">
            <span class="date-range">{{ formatDate(row.startTime) }} ~ {{ formatDate(row.endTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
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
        @size-change="loadCoupons"
        @current-change="loadCoupons"
      />
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
      class="coupon-dialog"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入优惠券名称" />
        </el-form-item>

        <el-form-item label="优惠券类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="0">满减券</el-radio>
            <el-radio :label="1">折扣券</el-radio>
            <el-radio :label="2">无门槛券</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="优惠额度" prop="amount">
          <el-input-number
            v-model="form.amount"
            :min="0"
            :max="form.type === 1 ? 1 : 99999"
            :precision="form.type === 1 ? 2 : 2"
            :step="form.type === 1 ? 0.1 : 1"
          />
          <span style="margin-left: 10px; color: #999">
            {{ form.type === 1 ? '折扣（0.1-1.0）' : '元' }}
          </span>
        </el-form-item>

        <el-form-item label="使用门槛" prop="minPoint">
          <el-input-number v-model="form.minPoint" :min="0" :precision="2" />
          <span style="margin-left: 10px; color: #999">元（0 表示无门槛）</span>
        </el-form-item>

        <el-form-item label="发放数量" prop="count">
          <el-input-number v-model="form.count" :min="1" />
        </el-form-item>

        <el-form-item label="每人限领" prop="perLimit">
          <el-input-number v-model="form.perLimit" :min="1" />
          <span style="margin-left: 10px; color: #999">张</span>
        </el-form-item>

        <el-form-item label="有效期" required>
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="使用说明">
          <el-input v-model="form.note" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../api/coupon'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加优惠券')
const formRef = ref(null)
const dateRange = ref([])

const searchForm = reactive({
  name: '',
  type: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  name: '',
  type: 0,
  amount: 0,
  minPoint: 0,
  count: 100,
  perLimit: 1,
  startTime: '',
  endTime: '',
  note: ''
})

const rules = {
  name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择优惠券类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入优惠额度', trigger: 'blur' }],
  count: [{ required: true, message: '请输入发放数量', trigger: 'blur' }],
  perLimit: [{ required: true, message: '请输入每人限领数量', trigger: 'blur' }]
}

const loadCoupons = async () => {
  loading.value = true
  try {
    const res = await getCoupons({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载优惠券列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadCoupons()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.type = ''
  pagination.page = 1
  loadCoupons()
}

const handleAdd = () => {
  dialogTitle.value = '添加优惠券'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑优惠券'
  Object.assign(form, row)
  dateRange.value = [new Date(row.startTime), new Date(row.endTime)]
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该优惠券吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteCoupon(row._id)
    ElMessage.success('删除成功')
    loadCoupons()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    if (!dateRange.value || dateRange.value.length !== 2) {
      ElMessage.error('请选择有效期')
      return
    }

    form.startTime = dateRange.value[0]
    form.endTime = dateRange.value[1]

    if (form._id) {
      await updateCoupon(form._id, form)
      ElMessage.success('更新成功')
    } else {
      await createCoupon(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadCoupons()
  } catch (error) {
    console.error('提交失败', error)
  }
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.keys(form).forEach(key => {
    if (key === 'type' || key === 'perLimit') {
      form[key] = key === 'type' ? 0 : 1
    } else if (key === 'count') {
      form[key] = 100
    } else if (typeof form[key] === 'number') {
      form[key] = 0
    } else {
      form[key] = ''
    }
  })
  dateRange.value = []
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  loadCoupons()
})
</script>

<style scoped>
.coupons-container {
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

.add-btn {
  background-color: #0066ff;
  border-color: #0066ff;
  border-radius: 6px;
  padding: 10px 24px;
  font-weight: 500;
}

.add-btn:hover {
  background-color: #0052cc;
  border-color: #0052cc;
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

.coupons-table {
  border: none;
}

:deep(.coupons-table .el-table__header th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: 600;
  border-bottom: 1px solid #e8eaed;
}

:deep(.coupons-table .el-table__body tr) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.coupons-table .el-table__body tr:hover > td) {
  background-color: #f9fafb;
}

.coupon-name {
  font-weight: 500;
  color: #1a1a1a;
}

.amount {
  font-weight: 600;
  color: #ff6b35;
  font-size: 15px;
}

.no-threshold {
  color: #52c41a;
}

.date-range {
  font-size: 13px;
  color: #666;
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

:deep(.coupon-dialog .el-form-item) {
  margin-bottom: 20px;
}

:deep(.coupon-dialog .el-dialog__body) {
  padding: 24px;
}
</style>
