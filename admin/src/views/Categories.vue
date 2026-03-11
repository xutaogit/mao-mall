<template>
  <div class="categories-container">
    <el-card>
      <template #header>
        <span>分类列表</span>
      </template>

      <!-- 分类表格 -->
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="{ row }">
            <span style="font-size: 24px">{{ row.icon }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" width="200" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="showStatus" label="显示状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.showStatus" type="success">显示</el-tag>
            <el-tag v-else type="info">隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分类详情对话框 -->
    <el-dialog v-model="detailVisible" title="分类详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="图标">
          <span style="font-size: 32px">{{ categoryDetail.icon }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="分类名称">{{ categoryDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ categoryDetail.sort }}</el-descriptions-item>
        <el-descriptions-item label="显示状态">
          <el-tag v-if="categoryDetail.showStatus" type="success">显示</el-tag>
          <el-tag v-else type="info">隐藏</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(categoryDetail.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCategories, getCategory } from '../api/category'

const loading = ref(false)
const tableData = ref([])
const detailVisible = ref(false)
const categoryDetail = ref({})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const loadCategories = async () => {
  loading.value = true
  try {
    const res = await getCategories()
    // 后端返回的是数组，不是 { list, total } 格式
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

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.categories-container {
  height: 100%;
}
</style>
