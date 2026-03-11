<template>
  <div class="address-list">
    <van-nav-bar title="收货地址" left-arrow @click-left="onClickLeft" fixed />
    
    <div class="content">
      <van-empty v-if="!loading && addresses.length === 0" description="暂无收货地址" />
      
      <van-swipe-cell v-for="address in addresses" :key="address._id">
        <van-cell @click="handleEdit(address)">
          <template #title>
            <div class="address-item">
              <div class="address-header">
                <span class="name">{{ address.name }}</span>
                <span class="phone">{{ address.phone }}</span>
                <van-tag v-if="address.defaultStatus === 1" type="danger" size="small">默认</van-tag>
              </div>
              <div class="address-detail">
                {{ address.province }} {{ address.city }} {{ address.region }} {{ address.detailAddress }}
              </div>
            </div>
          </template>
          <template #right-icon>
            <van-icon name="edit" />
          </template>
        </van-cell>
        <template #right>
          <van-button square type="danger" text="删除" @click="handleDelete(address._id)" />
        </template>
      </van-swipe-cell>
    </div>

    <div class="add-button">
      <van-button round block type="primary" @click="handleAdd">
        添加新地址
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getAddresses, deleteAddress } from '../api/address'

const router = useRouter()
const loading = ref(false)
const addresses = ref([])

const onClickLeft = () => {
  router.back()
}

const loadAddresses = async () => {
  loading.value = true
  try {
    const res = await getAddresses()
    addresses.value = res.data
  } catch (error) {
    console.error('获取地址列表失败', error)
    showToast('获取地址列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  router.push('/address/edit')
}

const handleEdit = (address) => {
  router.push(`/address/edit?id=${address._id}`)
}

const handleDelete = async (id) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要删除该地址吗？'
    })
    
    await deleteAddress(id)
    showToast('删除成功')
    loadAddresses()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除地址失败', error)
      showToast('删除失败')
    }
  }
}

onMounted(() => {
  loadAddresses()
})
</script>

<style scoped>
.address-list {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;
}

.content {
  padding-top: 46px;
}

.address-item {
  padding: 10px 0;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.phone {
  font-size: 14px;
  color: #646566;
}

.address-detail {
  font-size: 14px;
  color: #969799;
  line-height: 1.6;
}

.add-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>
