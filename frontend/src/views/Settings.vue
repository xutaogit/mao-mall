<template>
  <div class="settings">
    <van-nav-bar title="设置" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content">
      <van-cell-group inset>
        <van-cell title="账户安全" is-link icon="setting-o" />
        <van-cell title="隐私设置" is-link icon="setting-o" />
        <van-cell title="消息通知" is-link icon="bell-o" />
      </van-cell-group>

      <van-cell-group inset class="mt-20">
        <van-cell title="关于我们" is-link icon="info-o" @click="showAbout" />
        <van-cell title="用户协议" is-link icon="description" @click="showAgreement" />
        <van-cell title="隐私政策" is-link icon="description" @click="showPrivacy" />
      </van-cell-group>

      <van-cell-group inset class="mt-20">
        <van-cell title="检查更新" is-link icon="upgrade" @click="checkUpdate" />
        <van-cell title="清除缓存" is-link icon="delete-o" @click="clearCache" />
      </van-cell-group>

      <div class="version-info">
        <p>当前版本：v1.0.0</p>
      </div>
    </div>

    <van-tabbar v-model="active" route>
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="apps-o" to="/category">分类</van-tabbar-item>
      <van-tabbar-item icon="shopping-cart-o" to="/cart">购物车</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>

    <!-- 关于我们弹窗 -->
    <van-popup v-model:show="showAboutDialog" round position="bottom">
      <div class="popup-content">
        <div class="popup-header">关于我们</div>
        <div class="popup-body">
          <p>猫商城是一个专业的在线购物平台，致力于为用户提供优质的商品和服务。</p>
          <p>我们拥有完善的分销系统，让用户可以轻松推广商品赚取佣金。</p>
          <p>感谢您的支持和信任！</p>
        </div>
        <van-button round block type="primary" @click="showAboutDialog = false">
          关闭
        </van-button>
      </div>
    </van-popup>

    <!-- 用户协议弹窗 -->
    <van-popup v-model:show="showAgreementDialog" round position="bottom">
      <div class="popup-content">
        <div class="popup-header">用户协议</div>
        <div class="popup-body">
          <p>1. 用户在使用本平台服务时，应遵守相关法律法规。</p>
          <p>2. 用户应对自己的账户信息保密，不得将账户转让给他人。</p>
          <p>3. 用户不得发布违法、违规或侵犯他人权益的内容。</p>
          <p>4. 本平台有权对违反协议的用户进行处理。</p>
        </div>
        <van-button round block type="primary" @click="showAgreementDialog = false">
          关闭
        </van-button>
      </div>
    </van-popup>

    <!-- 隐私政策弹窗 -->
    <van-popup v-model:show="showPrivacyDialog" round position="bottom">
      <div class="popup-content">
        <div class="popup-header">隐私政策</div>
        <div class="popup-body">
          <p>1. 我们重视用户隐私，不会向第三方泄露用户信息。</p>
          <p>2. 用户信息仅用于提供更好的服务。</p>
          <p>3. 用户可以随时要求查看、修改或删除个人信息。</p>
          <p>4. 我们采用加密技术保护用户数据安全。</p>
        </div>
        <van-button round block type="primary" @click="showPrivacyDialog = false">
          关闭
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const active = ref(3)
const showAboutDialog = ref(false)
const showAgreementDialog = ref(false)
const showPrivacyDialog = ref(false)

const onClickLeft = () => {
  router.back()
}

const showAbout = () => {
  showAboutDialog.value = true
}

const showAgreement = () => {
  showAgreementDialog.value = true
}

const showPrivacy = () => {
  showPrivacyDialog.value = true
}

const checkUpdate = () => {
  showToast('已是最新版本')
}

const clearCache = () => {
  try {
    // 清除本地存储中的缓存数据（保留token和userInfo）
    const token = localStorage.getItem('token')
    const userInfo = localStorage.getItem('userInfo')
    localStorage.clear()
    if (token) localStorage.setItem('token', token)
    if (userInfo) localStorage.setItem('userInfo', userInfo)
    showToast('缓存已清除')
  } catch (error) {
    showToast('清除缓存失败')
  }
}
</script>

<style scoped>
.settings {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding-top: 46px;
  padding-bottom: 50px;
}

.mt-20 {
  margin-top: 20px;
}

.version-info {
  text-align: center;
  padding: 30px 20px;
  color: #969799;
  font-size: 13px;
}

.popup-content {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.popup-header {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #323233;
}

.popup-body {
  margin-bottom: 20px;
  line-height: 1.8;
}

.popup-body p {
  font-size: 14px;
  color: #646566;
  margin-bottom: 10px;
}

.popup-content :deep(.van-button) {
  margin-top: 10px;
}
</style>

