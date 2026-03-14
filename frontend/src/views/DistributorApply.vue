<template>
  <div class="distributor-apply">
    <van-nav-bar title="成为分销员" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content">
      <!-- 分销说明 -->
      <div class="intro-section">
        <div class="intro-title">分销员权益</div>
        <div class="intro-list">
          <div class="intro-item">
            <van-icon name="gold-coin-o" color="#ff6034" />
            <span>推广商品赚取佣金</span>
          </div>
          <div class="intro-item">
            <van-icon name="friends-o" color="#ff6034" />
            <span>邀请好友下单获得收益</span>
          </div>
          <div class="intro-item">
            <van-icon name="balance-o" color="#ff6034" />
            <span>佣金自动结算到微信零钱</span>
          </div>
        </div>
      </div>

      <!-- 申请表单 -->
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请输入手机号' }]"
            type="tel"
            maxlength="11"
          />
        </van-cell-group>

        <!-- 协议 -->
        <div class="agreement">
          <van-checkbox v-model="agreed">
            我已阅读并同意
            <span class="link">《分销员协议》</span>
          </van-checkbox>
        </div>

        <div class="submit-btn">
          <van-button 
            round 
            block 
            type="primary" 
            native-type="submit"
            :loading="loading"
            :disabled="!agreed"
          >
            提交申请
          </van-button>
        </div>
      </van-form>

      <!-- 申请须知 -->
      <div class="notice-section">
        <div class="notice-title">申请须知</div>
        <div class="notice-content">
          <p>1. 提交申请后，我们将在1-3个工作日内完成审核</p>
          <p>2. 审核通过后，您将获得专属推广链接和二维码</p>
          <p>3. 好友通过您的推广链接下单，您将获得相应佣金</p>
          <p>4. 佣金将在订单确认收货后自动结算</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { applyDistributor } from '../api/distributor'

const router = useRouter()
const phone = ref('')
const agreed = ref(false)
const loading = ref(false)

const onClickLeft = () => {
  router.back()
}

const onSubmit = async () => {
  if (!agreed.value) {
    showToast('请先阅读并同意分销员协议')
    return
  }

  loading.value = true
  try {
    await applyDistributor({ phone: phone.value })
    showToast('申请提交成功，请等待审核')
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    console.error('提交申请失败', error)
    showToast(error.response?.data?.message || '提交失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.distributor-apply {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding-top: 46px;
  padding-bottom: 20px;
}

.intro-section {
  background: linear-gradient(135deg, #ff6034 0%, #ee0a24 100%);
  padding: 30px 20px;
  color: white;
  margin-bottom: 15px;
}

.intro-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}

.intro-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.intro-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.agreement {
  padding: 15px 20px;
}

.link {
  color: var(--primary-color);
}

.submit-btn {
  padding: 20px;
}

.notice-section {
  background: white;
  margin: 15px;
  padding: 20px;
  border-radius: 8px;
}

.notice-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #323233;
}

.notice-content p {
  font-size: 14px;
  color: #646566;
  line-height: 1.8;
  margin-bottom: 8px;
}
</style>
