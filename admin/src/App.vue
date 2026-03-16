<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
}

#app {
  height: 100vh;
}

/* Element Plus 主题定制 */
:root {
  --el-color-primary: #0066ff;
  --el-color-primary-light-3: #e6f2ff;
  --el-color-primary-light-5: #cce5ff;
  --el-color-primary-light-7: #b3d9ff;
  --el-color-primary-light-8: #99ccff;
  --el-color-primary-light-9: #80bfff;
  --el-color-success: #52c41a;
  --el-color-warning: #faad14;
  --el-color-danger: #ff4d4f;
  --el-color-info: #1890ff;
  --el-border-radius-base: 6px;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f5f7fa;
}

::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>
