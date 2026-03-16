<template>
  <div class="categories-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">分类管理</h1>
        <p class="page-subtitle">共 {{ tableData.length }} 个分类</p>
      </div>
    </div>

    <!-- 分类卡片网格 -->
    <div class="categories-grid">
      <div v-for="category in tableData" :key="category._id" class="category-card" @click="handleView(category)">
        <div class="category-icon">{{ category.icon }}</div>
        <div class="category-info">
          <h3 class="category-name">{{ category.name }}</h3>
          <div class="category-meta">
            <span class="sort-badge">排序: {{ category.sort }}</span>
            <el-tag 
              v-if="category.showStatus" 
              type="success" 
              effect="light"
              size="small"
            >
              显示
            </el-tag>
            <el-tag 
              v-else 
              type="info" 
              effect="light"
              size="small"
            >
              隐藏
            </el-tag>
          </div>
          <div class="category-time">{{ formatDate(category.createdAt) }}</div>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 分类详情对话框 -->
    <el-dialog v-model="detailVisible" title="分类详情" width="500px" class="detail-dialog">
      <div class="detail-content">
        <div class="detail-icon">{{ categoryDetail.icon }}</div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="分类名称">{{ categoryDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ categoryDetail.sort }}</el-descriptions-item>
          <el-descriptions-item label="显示状态">
            <el-tag v-if="categoryDetail.showStatus" type="success" effect="light">显示</el-tag>
            <el-tag v-else type="info" effect="light">隐藏</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(categoryDetail.createdAt) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEdit(categoryDetail)">编辑</el-button>
      </template>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog v-model="editVisible" title="编辑分类" width="500px" class="edit-dialog">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="分类图标">
          <el-input v-model="editForm.icon" placeholder="请输入emoji或图标" />
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input v-model="editForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="editForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="显示状态">
          <el-switch v-model="editForm.showStatus" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import { getCategories, getCategory, updateCategory } from '../api/category'

const loading = ref(false)
const tableData = ref([])
const detailVisible = ref(false)
const editVisible = ref(false)
const categoryDetail = ref({})
const editForm = ref({
  icon: '',
  name: '',
  sort: 0,
  showStatus: true
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const loadCategories = async () => {
  loading.value = true
  try {
    const res = await getCategories()
    tableData.value = Array.isArray(res.data) ? res.data : (res.data.list || [])
  } catch (error) {
    console.error('加载分类失败', error)
  } finally {
    loading.value = false
  }
}

const handleView = async (row) => {
  try {
    const res = await getCategory(row._id)
    categoryDetail.value = res.data
    detailVisible.value = true
  } catch (error) {
    console.error('获取分类详情失败', error)
  }
}

const handleEdit = (category) => {
  editForm.value = {
    _id: category._id,
    icon: category.icon,
    name: category.name,
    sort: category.sort,
    showStatus: category.showStatus
  }
  detailVisible.value = false
  editVisible.value = true
}

const handleSave = async () => {
  if (!editForm.value.name) {
    ElMessage.warning('请输入分类名称')
    return
  }
  
  try {
    await updateCategory(editForm.value._id, {
      icon: editForm.value.icon,
      name: editForm.value.name,
      sort: editForm.value.sort,
      showStatus: editForm.value.showStatus
    })
    ElMessage.success('保存成功')
    editVisible.value = false
    loadCategories()
  } catch (error) {
    console.error('保存失败', error)
    ElMessage.error('保存失败')
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.categories-container {
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.category-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e8eaed;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  border-color: #0066ff;
  box-shadow: 0 4px 16px rgba(0, 102, 255, 0.15);
  transform: translateY(-2px);
}

.category-icon {
  font-size: 48px;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.category-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.sort-badge {
  font-size: 12px;
  color: #999;
  background-color: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.category-time {
  font-size: 12px;
  color: #ccc;
}

.arrow-icon {
  font-size: 20px;
  color: #ccc;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.category-card:hover .arrow-icon {
  color: #0066ff;
  transform: translateX(4px);
}

:deep(.detail-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.edit-dialog .el-form-item) {
  margin-bottom: 20px;
}

:deep(.edit-dialog .el-dialog__body) {
  padding: 24px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.detail-icon {
  font-size: 64px;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
  border-radius: 12px;
  color: #fff;
}

:deep(.detail-dialog .el-descriptions) {
  width: 100%;
}

:deep(.detail-dialog .el-descriptions__item) {
  padding: 12px 16px;
}
</style>
