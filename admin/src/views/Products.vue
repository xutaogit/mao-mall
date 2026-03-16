<template>
  <div class="products-container">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">商品管理</h1>
        <p class="page-subtitle">共 {{ pagination.total }} 件商品</p>
      </div>
      <el-button type="primary" size="large" @click="handleAdd" class="add-btn">
        <el-icon><Plus /></el-icon>
        新增商品
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索商品名称..."
        clearable
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="filterStatus" placeholder="全部分类" class="filter-select">
        <el-option label="全部分类" value="" />
        <el-option label="在售" value="1" />
        <el-option label="已下架" value="0" />
      </el-select>
      <el-button @click="handleSearch" class="search-btn">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset" class="reset-btn">重置</el-button>
    </div>

    <!-- 商品表格 -->
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        stripe
        class="products-table"
      >
        <el-table-column prop="pic" label="商品图片" width="100">
          <template #default="{ row }">
            <div class="product-image">
              <el-image :src="row.pic" fit="cover" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品信息" min-width="250">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-name">{{ row.name }}</div>
              <div class="product-sn">ID: {{ row.productSn }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80">
          <template #default="{ row }">
            <span :class="['stock', row.stock > 0 ? 'in-stock' : 'out-stock']">
              {{ row.stock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sale" label="销量" width="80">
          <template #default="{ row }">
            {{ row.sale || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="publishStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.publishStatus"
              :active-value="1"
              :inactive-value="0"
              @change="handlePublishChange(row)"
              class="status-switch"
            />
          </template>
        </el-table-column>
        <el-table-column prop="recommendStatus" label="推荐" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.recommendStatus" type="success" effect="light">推荐</el-tag>
            <el-tag v-else type="info" effect="light">普通</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
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
        @size-change="loadProducts"
        @current-change="loadProducts"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { getProducts, deleteProduct, updatePublishStatus } from '../api/product'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const filterStatus = ref('')

const searchForm = reactive({
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await getProducts({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载商品失败', error)
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadProducts()
}

const handleReset = () => {
  searchForm.keyword = ''
  filterStatus.value = ''
  pagination.page = 1
  loadProducts()
}

const handleAdd = () => {
  router.push('/products/edit')
}

const handleEdit = (row) => {
  router.push(`/products/edit?id=${row._id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteProduct(row._id)
    ElMessage.success('删除成功')
    loadProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  }
}

const handlePublishChange = async (row) => {
  try {
    await updatePublishStatus(row._id, row.publishStatus)
    ElMessage.success('更新成功')
  } catch (error) {
    row.publishStatus = row.publishStatus === 1 ? 0 : 1
    console.error('更新失败', error)
    ElMessage.error('更新失败')
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.products-container {
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

.products-table {
  border: none;
}

:deep(.products-table .el-table__header th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: 600;
  border-bottom: 1px solid #e8eaed;
}

:deep(.products-table .el-table__body tr) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.products-table .el-table__body tr:hover > td) {
  background-color: #f9fafb;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f5f7fa;
}

:deep(.product-image .el-image) {
  width: 100%;
  height: 100%;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 500;
  color: #1a1a1a;
  font-size: 14px;
}

.product-sn {
  font-size: 12px;
  color: #999;
}

.price {
  font-size: 16px;
  font-weight: 600;
  color: #ff6b35;
}

.stock {
  font-size: 14px;
  font-weight: 500;
}

.stock.in-stock {
  color: #52c41a;
}

.stock.out-stock {
  color: #ff4d4f;
}

.status-switch {
  --el-switch-on-color: #0066ff;
  --el-switch-off-color: #ccc;
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
</style>
