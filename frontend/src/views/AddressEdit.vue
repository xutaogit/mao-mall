<template>
  <div class="address-edit">
    <van-nav-bar :title="isEdit ? '编辑地址' : '添加地址'" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.name"
            name="name"
            label="收货人"
            placeholder="请输入收货人姓名"
            :rules="[{ required: true, message: '请输入收货人姓名' }]"
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
            v-model="areaText"
            is-link
            readonly
            name="area"
            label="所在地区"
            placeholder="请选择省市区"
            @click="showArea = true"
            :rules="[{ required: true, message: '请选择所在地区' }]"
          />
          <van-field
            v-model="form.detailAddress"
            name="detailAddress"
            label="详细地址"
            type="textarea"
            rows="3"
            placeholder="请输入详细地址"
            :rules="[{ required: true, message: '请输入详细地址' }]"
          />
          <van-field name="defaultStatus" label="设为默认地址">
            <template #input>
              <van-switch v-model="form.defaultStatus" :active-value="1" :inactive-value="0" />
            </template>
          </van-field>
        </van-cell-group>

        <div class="submit-button">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            保存
          </van-button>
        </div>
      </van-form>
    </div>

    <van-popup v-model:show="showArea" position="bottom">
      <van-area
        :area-list="areaList"
        @confirm="onAreaConfirm"
        @cancel="showArea = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { areaList } from '@vant/area-data'
import { getAddress, addAddress, updateAddress } from '../api/address'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const showArea = ref(false)

const isEdit = computed(() => !!route.query.id)

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  region: '',
  detailAddress: '',
  defaultStatus: 0
})

const areaText = computed(() => {
  if (form.province && form.city && form.region) {
    return `${form.province} ${form.city} ${form.region}`
  }
  return ''
})

const onClickLeft = () => {
  router.back()
}

const onAreaConfirm = ({ selectedOptions }) => {
  form.province = selectedOptions[0].text
  form.city = selectedOptions[1].text
  form.region = selectedOptions[2].text
  showArea.value = false
}

const loadAddress = async () => {
  if (!isEdit.value) return

  try {
    const res = await getAddress(route.query.id)
    Object.assign(form, res.data)
  } catch (error) {
    console.error('获取地址详情失败', error)
    showToast('获取地址详情失败')
  }
}

const onSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      await updateAddress(route.query.id, form)
      showToast('更新成功')
    } else {
      await addAddress(form)
      showToast('添加成功')
    }
    
    setTimeout(() => {
      router.back()
    }, 1000)
  } catch (error) {
    console.error('保存地址失败', error)
    showToast(error.response?.data?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAddress()
})
</script>

<style scoped>
.address-edit {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding-top: 46px;
  padding-bottom: 20px;
}

.submit-button {
  margin-top: 30px;
  padding: 0 16px;
}
</style>
