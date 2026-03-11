<template>
  <div class="refund-apply">
    <van-nav-bar title="申请退款" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content">
      <!-- 订单信息 -->
      <van-cell-group class="order-info" v-if="order">
        <van-cell title="订单信息" />
        <div class="order-goods">
          <div class="goods-item" v-for="item in order.orderItems" :key="item.productId">
            <img :src="item.productPic" class="goods-image" />
            <div class="goods-info">
              <div class="goods-name">{{ item.productName }}</div>
              <div class="goods-price">¥{{ item.productPrice }} x{{ item.productQuantity }}</div>
            </div>
          </div>
        </div>
        <van-cell title="订单金额" :value="`¥${order.totalAmount}`" />
      </van-cell-group>

      <!-- 退款表单 -->
      <van-form @submit="onSubmit">
        <van-cell-group>
          <van-field
            v-model="refundAmount"
            name="refundAmount"
            label="退款金额"
            type="number"
            placeholder="请输入退款金额"
            :rules="[{ required: true, message: '请输入退款金额' }]"
          />
          
          <van-field
            name="refundType"
            label="退款类型"
          >
            <template #input>
              <van-radio-group v-model="form.refundType" direction="horizontal">
                <van-radio :name="0">仅退款</van-radio>
                <van-radio :name="1">退货退款</van-radio>
              </van-radio-group>
            </template>
          </van-field>

          <van-field
            v-model="form.reason"
            name="reason"
            label="退款原因"
            placeholder="请选择退款原因"
            is-link
            readonly
            @click="showReasonPicker = true"
            :rules="[{ required: true, message: '请选择退款原因' }]"
          />

          <van-field
            v-model="form.description"
            name="description"
            label="问题描述"
            type="textarea"
            rows="3"
            placeholder="请详细描述问题"
            maxlength="200"
            show-word-limit
          />

          <van-field name="proofPics" label="上传凭证">
            <template #input>
              <van-uploader
                v-model="fileList"
                multiple
                :max-count="3"
                :after-read="afterRead"
              />
            </template>
          </van-field>
        </van-cell-group>

        <div class="submit-button">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            提交申请
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 退款原因选择器 -->
    <van-popup v-model:show="showReasonPicker" position="bottom">
      <van-picker
        :columns="reasonOptions"
        @confirm="onReasonConfirm"
        @cancel="showReasonPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getOrder } from '../api/order'
import { applyRefund } from '../api/refund'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const order = ref(null)
const showReasonPicker = ref(false)
const fileList = ref([])

const form = reactive({
  refundType: 0,
  reason: '',
  description: '',
  proofPics: []
})

const refundAmount = computed({
  get: () => order.value?.totalAmount || 0,
  set: (val) => {}
})

const reasonOptions = [
  { text: '商品质量问题', value: '商品质量问题' },
  { text: '商品与描述不符', value: '商品与描述不符' },
  { text: '商品破损', value: '商品破损' },
  { text: '发错货', value: '发错货' },
  { text: '不想要了', value: '不想要了' },
  { text: '其他原因', value: '其他原因' }
]

const onClickLeft = () => {
  router.back()
}

const loadOrder = async () => {
  try {
    const res = await getOrder(route.query.orderId)
    order.value = res.data
  } catch (error) {
    console.error('获取订单失败', error)
    showToast('获取订单失败')
  }
}

const onReasonConfirm = ({ selectedOptions }) => {
  form.reason = selectedOptions[0]?.text || selectedOptions[0] || ''
  showReasonPicker.value = false
}

const afterRead = (file) => {
  // 这里应该上传图片到服务器，返回图片URL
  // 暂时使用本地预览URL
  if (Array.isArray(file)) {
    file.forEach(f => {
      form.proofPics.push(f.content)
    })
  } else {
    form.proofPics.push(file.content)
  }
}

const onSubmit = async () => {
  if (!order.value) {
    showToast('订单信息加载中')
    return
  }

  loading.value = true
  try {
    await applyRefund({
      orderId: order.value._id,
      refundAmount: parseFloat(refundAmount.value),
      refundType: form.refundType,
      reason: form.reason,
      description: form.description,
      proofPics: form.proofPics
    })

    showToast('退款申请提交成功')
    
    setTimeout(() => {
      router.push('/refunds')
    }, 1000)
  } catch (error) {
    console.error('申请退款失败', error)
    showToast(error.response?.data?.message || '申请失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.orderId) {
    loadOrder()
  } else {
    showToast('缺少订单信息')
    router.back()
  }
})
</script>

<style scoped>
.refund-apply {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.content {
  padding-top: 46px;
}

.order-info {
  margin-bottom: 10px;
}

.order-goods {
  padding: 15px;
}

.goods-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.goods-item:last-child {
  margin-bottom: 0;
}

.goods-image {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  object-fit: cover;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 14px;
  color: #323233;
  line-height: 1.4;
  margin-bottom: 8px;
}

.goods-price {
  font-size: 14px;
  color: #969799;
}

.submit-button {
  margin-top: 30px;
  padding: 0 16px;
}
</style>
