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
            <span class="link" @click="showAgreement">《分销员协议》</span>
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

    <!-- 分销员协议弹窗 -->
    <van-popup v-model:show="agreementVisible" round position="bottom">
      <div class="agreement-popup">
        <div class="popup-header">
          <h2>分销员协议</h2>
          <van-icon name="close" @click="agreementVisible = false" />
        </div>
        <div class="popup-content">
          <div class="agreement-section">
            <h3>第一条 总则</h3>
            <p>1.1 本协议是猫商城平台（以下简称"平台"）与分销员之间的法律协议。</p>
            <p>1.2 分销员是指通过平台提供的推广链接或二维码，推广平台商品并获得佣金的用户。</p>
            <p>1.3 分销员应遵守本协议的所有条款，违反协议将承担相应责任。</p>
          </div>

          <div class="agreement-section">
            <h3>第二条 分销员权利</h3>
            <p>2.1 获得专属推广链接和二维码，用于推广平台商品。</p>
            <p>2.2 根据推广成果获得相应的佣金收益。</p>
            <p>2.3 查看实时的推广数据和佣金统计。</p>
            <p>2.4 申请提现已结算的佣金到指定银行账户。</p>
            <p>2.5 获得平台提供的推广工具和营销支持。</p>
          </div>

          <div class="agreement-section">
            <h3>第三条 分销员义务</h3>
            <p>3.1 真实、准确地填写个人信息，对提供的信息真实性负责。</p>
            <p>3.2 不得虚假宣传、夸大商品功能或效果。</p>
            <p>3.3 不得通过不正当手段（如刷单、虚假交易等）获取佣金。</p>
            <p>3.4 不得将推广链接用于非法目的或违反法律的活动。</p>
            <p>3.5 不得泄露平台的商业机密或其他用户的隐私信息。</p>
            <p>3.6 遵守平台的各项规则和管理制度。</p>
          </div>

          <div class="agreement-section">
            <h3>第四条 佣金规则</h3>
            <p>4.1 佣金计算：根据商品设置的佣金比例或固定金额计算。</p>
            <p>4.2 佣金生成：消费者通过分销员推广链接下单，订单确认收货后自动生成佣金。</p>
            <p>4.3 佣金结算：平台每月进行一次佣金结算，结算后的佣金可申请提现。</p>
            <p>4.4 佣金有效期：佣金自生成之日起，有效期为12个月。</p>
            <p>4.5 佣金扣除：因退货、退款等原因，相应佣金将被扣除。</p>
          </div>

          <div class="agreement-section">
            <h3>第五条 推广关系</h3>
            <p>5.1 推广关系有效期：消费者通过分销员推广链接绑定后，有效期为30天。</p>
            <p>5.2 最后点击有效：消费者可以重新绑定其他分销员，最后点击的分销员有效。</p>
            <p>5.3 推广人数统计：平台统计分销员的推广人数，用于分销员等级评定。</p>
          </div>

          <div class="agreement-section">
            <h3>第六条 提现规则</h3>
            <p>6.1 提现条件：已结算的佣金满足最低提现金额（如有设置）可申请提现。</p>
            <p>6.2 提现方式：支持提现到指定银行账户或微信零钱。</p>
            <p>6.3 提现审核：平台将在3-5个工作日内审核提现申请。</p>
            <p>6.4 提现手续费：平台不收取提现手续费，银行手续费由分销员承担。</p>
            <p>6.5 提现失败：提现失败的佣金将返回到分销员账户。</p>
          </div>

          <div class="agreement-section">
            <h3>第七条 违规处理</h3>
            <p>7.1 违反本协议的分销员，平台有权采取以下措施：</p>
            <p>　　(1) 警告或扣除部分佣金</p>
            <p>　　(2) 暂停推广权限</p>
            <p>　　(3) 永久取消分销员资格</p>
            <p>7.2 情节严重的，平台保留追究法律责任的权利。</p>
          </div>

          <div class="agreement-section">
            <h3>第八条 免责声明</h3>
            <p>8.1 平台不对分销员的推广效果做任何保证。</p>
            <p>8.2 分销员因推广活动产生的纠纷，由分销员自行承担责任。</p>
            <p>8.3 平台有权根据实际情况调整佣金比例和规则，提前30天通知。</p>
            <p>8.4 因不可抗力因素导致的损失，平台不承担责任。</p>
          </div>

          <div class="agreement-section">
            <h3>第九条 协议修改</h3>
            <p>9.1 平台有权根据法律变化或业务需要修改本协议。</p>
            <p>9.2 修改后的协议将在平台公布，分销员继续使用平台即视为同意新协议。</p>
          </div>

          <div class="agreement-section">
            <h3>第十条 其他</h3>
            <p>10.1 本协议自分销员同意之日起生效。</p>
            <p>10.2 本协议的解释权归平台所有。</p>
            <p>10.3 如有任何疑问，请联系平台客服。</p>
          </div>
        </div>
        <div class="popup-footer">
          <van-button round block type="primary" @click="agreeAgreement">
            我已阅读并同意
          </van-button>
        </div>
      </div>
    </van-popup>
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
const agreementVisible = ref(false)

const onClickLeft = () => {
  router.back()
}

const showAgreement = () => {
  agreementVisible.value = true
}

const agreeAgreement = () => {
  agreed.value = true
  agreementVisible.value = false
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

.agreement-popup {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebedf0;
  position: sticky;
  top: 0;
  background: white;
}

.popup-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #323233;
}

.popup-header .van-icon {
  cursor: pointer;
  font-size: 24px;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.agreement-section {
  margin-bottom: 20px;
}

.agreement-section h3 {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 10px;
}

.agreement-section p {
  font-size: 13px;
  color: #646566;
  line-height: 1.8;
  margin-bottom: 8px;
}

.popup-footer {
  padding: 15px 20px;
  border-top: 1px solid #ebedf0;
  background: white;
}
</style>
