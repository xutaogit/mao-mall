<template>
  <el-container class="layout">
    <el-aside width="267px" class="sidebar">
      <div class="logo">
        <div class="logo-icon">🏪</div>
        <h2>商城后台</h2>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#1a1f2e"
        text-color="#a0a9b8"
        active-text-color="#fff"
        active-background-color="#0066ff"
        class="sidebar-menu"
      >
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><Menu /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/refunds">
          <el-icon><RefreshLeft /></el-icon>
          <span>退款管理</span>
        </el-menu-item>
        <el-menu-item index="/coupons">
          <el-icon><Ticket /></el-icon>
          <span>优惠券管理</span>
        </el-menu-item>
        <el-menu-item index="/distributors">
          <el-icon><Share /></el-icon>
          <span>分销管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container class="main-container">
      <el-header class="top-header">
        <div class="header-left">
          <span class="breadcrumb">首页 / {{ $route.meta.title }}</span>
        </div>
        <div class="header-right">
          <el-input
            v-model="searchQuery"
            placeholder="搜索..."
            class="search-input"
            :prefix-icon="Search"
          />
          <el-icon class="notification-icon"><Bell /></el-icon>
          <el-dropdown @command="handleCommand" class="user-dropdown">
            <div class="user-avatar">
              <span class="avatar-text">{{ adminUser.username?.charAt(0) || '管' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Bell, SwitchButton, Goods, Menu, Document, RefreshLeft, Ticket, Share } from '@element-plus/icons-vue'

const router = useRouter()
const searchQuery = ref('')

const adminUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('adminUser') || '{}')
  } catch {
    return {}
  }
})

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch {
      // 取消
    }
  }
}
</script>

<style scoped>
.layout {
  height: 100vh;
  background-color: #f5f7fa;
}

.sidebar {
  background-color: #1a1f2e;
  border-right: 1px solid #2a3142;
  overflow-y: auto;
}

.logo {
  padding: 24px 16px;
  text-align: center;
  border-bottom: 1px solid #2a3142;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
}

.logo h2 {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.sidebar-menu {
  border: none;
  padding: 12px 0;
}

:deep(.sidebar-menu .el-menu-item) {
  margin: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.sidebar-menu .el-menu-item:hover) {
  background-color: #252d3d !important;
}

:deep(.sidebar-menu .el-menu-item.is-active) {
  background-color: #0066ff !important;
  border-radius: 6px;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.top-header {
  background-color: #fff;
  border-bottom: 1px solid #e8eaed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 64px;
}

.header-left {
  flex: 1;
}

.breadcrumb {
  color: #666;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.search-input {
  width: 200px;
}

:deep(.search-input .el-input__wrapper) {
  background-color: #f5f7fa;
  border: 1px solid #e8eaed;
}

.notification-icon {
  font-size: 20px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.notification-icon:hover {
  color: #0066ff;
}

.user-dropdown {
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.avatar-text {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

.main-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}
</style>
