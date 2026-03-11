<template>
  <div class="register-page">
    <van-nav-bar title="注册" left-arrow @click-left="onClickLeft" />
    
    <div class="register-content">
      <div class="logo">
        <h1>🐱 猫商城</h1>
        <p>创建新账号</p>
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
            placeholder="请输入密码（至少6位）"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]"
          />
          <van-field
            v-model="form.confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[{ required: true, message: '请再次输入密码' }]"
          />
          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]"
          />
          <van-field
            v-model="form.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱（可选）"
          />
        </van-cell-group>

        <div class="register-actions">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            注册
          </van-button>
          <div class="links">
            <span @click="goToLogin">已有账号？立即登录</span>
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
import { register } from '../api/auth'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: ''
})

const onClickLeft = () => {
  router.back()
}

const onSubmit = async () => {
  // 验证两次密码是否一致
  if (form.password !== form.confirmPassword) {
    showToast('两次密码不一致')
    return
  }

  loading.value = true
  try {
    const res = await register({
      username: form.username,
      password: form.password,
      phone: form.phone,
      email: form.email
    })
    
    // 保存 token 和用户信息
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userInfo', JSON.stringify(res.data.user))
    
    showToast('注册成功')
    
    // 跳转到个人中心
    setTimeout(() => {
      router.push('/user')
    }, 1000)
  } catch (error) {
    console.error('注册失败', error)
    showToast(error.response?.data?.message || '注册失败')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.register-content {
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

.register-actions {
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
