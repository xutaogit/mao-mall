<template>
  <div class="login-page">
    <van-nav-bar title="登录" left-arrow @click-left="onClickLeft" />
    
    <div class="login-content">
      <div class="logo">
        <h1>🐱 猫商城</h1>
        <p>欢迎回来</p>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
          />
        </van-cell-group>

        <div class="login-actions">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            登录
          </van-button>
          <div class="links">
            <span @click="goToRegister">还没有账号？立即注册</span>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { login } from '../api/auth'
import { bindDistributor } from '../api/distributor'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const onClickLeft = () => {
  router.back()
}

const onSubmit = async () => {
  loading.value = true
  try {
    const res = await login(form)
    
    // 保存 token 和用户信息
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userInfo', JSON.stringify(res.data.user))
    
    showToast('登录成功')
    
    // 检查是否有待绑定的分销员代码
    const pendingDistributorCode = localStorage.getItem('pendingDistributorCode')
    if (pendingDistributorCode) {
      try {
        await bindDistributor({ distributorCode: pendingDistributorCode })
        localStorage.removeItem('pendingDistributorCode')
        console.log('分销关系绑定成功')
      } catch (error) {
        console.error('绑定分销关系失败:', error)
      }
    }
    
    // 跳转到个人中心或返回上一页
    setTimeout(() => {
      router.push('/user')
    }, 1000)
  } catch (error) {
    console.error('登录失败', error)
    showToast(error.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.login-content {
  padding: 40px 20px;
}

.logo {
  text-align: center;
  margin-bottom: 40px;
}

.logo h1 {
  font-size: 32px;
  color: #323233;
  margin-bottom: 10px;
}

.logo p {
  font-size: 14px;
  color: #969799;
}

.login-actions {
  margin-top: 30px;
  padding: 0 16px;
}

.links {
  margin-top: 20px;
  text-align: center;
}

.links span {
  color: var(--primary-color);
  font-size: 14px;
  cursor: pointer;
}
</style>
