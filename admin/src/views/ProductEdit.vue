<template>
  <div class="product-edit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑商品' : '添加商品' }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" style="width: 400px" />
        </el-form-item>

        <el-form-item label="商品分类" prop="categoryId">
          <el-cascader
            v-model="form.categoryId"
            :options="categoryOptions"
            :props="{ value: '_id', label: 'name', children: 'children', checkStrictly: true }"
            placeholder="请选择商品分类"
            style="width: 400px"
            clearable
          />
        </el-form-item>

        <el-form-item label="商品编号" prop="productSn">
          <el-input v-model="form.productSn" placeholder="请输入商品编号" style="width: 400px" />
        </el-form-item>

        <el-form-item label="副标题">
          <el-input v-model="form.subTitle" placeholder="请输入副标题" style="width: 400px" />
        </el-form-item>

        <!-- 价格库存 -->
        <el-divider content-position="left">价格库存</el-divider>

        <el-form-item label="商品价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
          <span style="margin-left: 10px; color: #999">元</span>
        </el-form-item>

        <el-form-item label="促销价格">
          <el-input-number v-model="form.promotionPrice" :min="0" :precision="2" />
          <span style="margin-left: 10px; color: #999">元（可选）</span>
        </el-form-item>

        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" />
          <span style="margin-left: 10px; color: #999">{{ form.unit || '件' }}</span>
        </el-form-item>

        <el-form-item label="单位">
          <el-input v-model="form.unit" placeholder="件" style="width: 200px" />
        </el-form-item>

        <!-- 商品图片 -->
        <el-divider content-position="left">商品图片</el-divider>

        <el-form-item label="主图" prop="pic">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="handleMainImageUpload"
          >
            <img v-if="form.pic" :src="form.pic" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div style="color: #999; font-size: 12px; margin-top: 5px">
            建议尺寸：750x750px，支持 jpg、png 格式
          </div>
        </el-form-item>

        <el-form-item label="商品相册">
          <el-upload
            v-model:file-list="albumFileList"
            action="#"
            list-type="picture-card"
            :http-request="handleAlbumUpload"
            :on-remove="handleAlbumRemove"
            :limit="5"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div style="color: #999; font-size: 12px; margin-top: 5px">
            最多上传 5 张图片
          </div>
        </el-form-item>

        <!-- SKU 规格 -->
        <el-divider content-position="left">商品规格</el-divider>

        <el-form-item label="启用规格">
          <el-switch v-model="enableSku" @change="handleSkuChange" />
          <span style="margin-left: 10px; color: #999">开启后可设置多规格商品</span>
        </el-form-item>

        <el-form-item v-if="enableSku" label="规格设置">
          <div class="sku-container">
            <div v-for="(spec, index) in form.specs" :key="index" class="spec-item">
              <el-input
                v-model="spec.name"
                placeholder="规格名（如：颜色）"
                style="width: 150px; margin-right: 10px"
              />
              <el-select
                v-model="spec.values"
                multiple
                filterable
                allow-create
                placeholder="规格值（如：红色、蓝色）"
                style="width: 300px; margin-right: 10px"
              >
              </el-select>
              <el-button type="danger" @click="removeSpec(index)">删除</el-button>
            </div>
            <el-button @click="addSpec" style="margin-top: 10px">添加规格</el-button>
          </div>
        </el-form-item>

        <el-form-item v-if="enableSku && skuList.length > 0" label="SKU 列表">
          <el-table :data="skuList" border style="width: 100%">
            <el-table-column
              v-for="spec in form.specs"
              :key="spec.name"
              :prop="spec.name"
              :label="spec.name"
              width="120"
            />
            <el-table-column label="价格" width="150">
              <template #default="{ row }">
                <el-input-number v-model="row.price" :min="0" :precision="2" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="库存" width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.stock" :min="0" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="SKU 编码" width="150">
              <template #default="{ row }">
                <el-input v-model="row.skuCode" size="small" />
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <!-- 商品详情 -->
        <el-divider content-position="left">商品详情</el-divider>

        <el-form-item label="商品描述">
          <el-input v-model="form.description" type="textarea" :rows="3" style="width: 600px" />
        </el-form-item>

        <el-form-item label="详情内容">
          <el-input
            v-model="form.detailHtml"
            type="textarea"
            :rows="10"
            placeholder="支持 HTML 格式"
            style="width: 600px"
          />
          <div style="color: #999; font-size: 12px; margin-top: 5px">
            提示：可以使用富文本编辑器生成 HTML 内容
          </div>
        </el-form-item>

        <!-- 其他设置 -->
        <el-divider content-position="left">其他设置</el-divider>

        <el-form-item label="上架状态">
          <el-switch v-model="form.publishStatus" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item label="推荐">
          <el-switch v-model="form.recommendStatus" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item label="新品">
          <el-switch v-model="form.newStatus" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getProduct, createProduct, updateProduct } from '../api/product'
import { getCategories } from '../api/category'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const submitting = ref(false)
const enableSku = ref(false)
const albumFileList = ref([])
const categoryOptions = ref([])

const isEdit = computed(() => !!route.query.id)

const form = reactive({
  name: '',
  categoryId: '',
  productSn: '',
  subTitle: '',
  price: 0,
  promotionPrice: 0,
  stock: 0,
  unit: '件',
  pic: '',
  albumPics: [],
  description: '',
  detailHtml: '',
  publishStatus: 1,
  recommendStatus: 0,
  newStatus: 0,
  specs: []
})

const skuList = ref([])

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  productSn: [{ required: true, message: '请输入商品编号', trigger: 'blur' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  pic: [{ required: true, message: '请上传商品主图', trigger: 'change' }]
}

// 加载分类
const loadCategories = async () => {
  try {
    const res = await getCategories()
    categoryOptions.value = res.data
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

// 加载商品详情
const loadProduct = async () => {
  try {
    const res = await getProduct(route.query.id)
    Object.assign(form, res.data)
    
    // 处理相册
    if (form.albumPics && form.albumPics.length > 0) {
      albumFileList.value = form.albumPics.map((url, index) => ({
        name: `image-${index}`,
        url
      }))
    }

    // 处理 SKU
    if (form.specs && form.specs.length > 0) {
      enableSku.value = true
      generateSkuList()
    }
  } catch (error) {
    console.error('加载商品失败', error)
    ElMessage.error('加载商品失败')
  }
}

// 添加规格
const addSpec = () => {
  form.specs.push({
    name: '',
    values: []
  })
}

// 删除规格
const removeSpec = (index) => {
  form.specs.splice(index, 1)
  generateSkuList()
}

// SKU 开关变化
const handleSkuChange = (value) => {
  if (value) {
    if (form.specs.length === 0) {
      addSpec()
    }
  } else {
    form.specs = []
    skuList.value = []
  }
}

// 生成 SKU 列表
const generateSkuList = () => {
  const validSpecs = form.specs.filter(spec => spec.name && spec.values.length > 0)
  
  if (validSpecs.length === 0) {
    skuList.value = []
    return
  }

  // 笛卡尔积生成所有组合
  const cartesian = (...arrays) => {
    return arrays.reduce((acc, array) => {
      return acc.flatMap(x => array.map(y => [...x, y]))
    }, [[]])
  }

  const combinations = cartesian(...validSpecs.map(spec => spec.values))
  
  skuList.value = combinations.map(combo => {
    const skuData = {}
    validSpecs.forEach((spec, index) => {
      skuData[spec.name] = combo[index]
    })
    
    return {
      ...skuData,
      spData: JSON.stringify(skuData),
      price: form.price,
      stock: form.stock,
      skuCode: ''
    }
  })
}

// 监听规格变化
watch(() => form.specs, () => {
  if (enableSku.value) {
    generateSkuList()
  }
}, { deep: true })

// 上传主图
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleMainImageUpload = async ({ file }) => {
  // 这里应该调用上传接口，暂时使用本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    form.pic = e.target.result
  }
  reader.readAsDataURL(file)
}

// 上传相册
const handleAlbumUpload = async ({ file }) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.albumPics.push(e.target.result)
  }
  reader.readAsDataURL(file)
}

const handleAlbumRemove = (file) => {
  const index = albumFileList.value.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    form.albumPics.splice(index, 1)
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    const data = { ...form }
    
    // 如果启用了 SKU，添加 SKU 数据
    if (enableSku.value && skuList.value.length > 0) {
      data.skuList = skuList.value
    }

    if (isEdit.value) {
      await updateProduct(route.query.id, data)
      ElMessage.success('更新成功')
    } else {
      await createProduct(data)
      ElMessage.success('创建成功')
    }
    
    router.push('/products')
  } catch (error) {
    console.error('提交失败', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadCategories()
  if (isEdit.value) {
    loadProduct()
  }
})
</script>

<style scoped>
.product-edit-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.sku-container {
  width: 100%;
}

.spec-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
