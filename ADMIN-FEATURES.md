# 后台管理系统功能补充说明

**更新时间：** 2026-03-06  
**版本：** v1.1.0

---

## 📊 已补充功能清单

### 1. 商品管理增强 ✅

#### 1.1 商品编辑页面（ProductEdit.vue）
**路径：** `/products/edit`

**功能特性：**
- ✅ 基本信息编辑（名称、编号、副标题）
- ✅ **分类选择**（级联选择器，支持多级分类）
- ✅ 价格库存管理（价格、促销价、库存、单位）
- ✅ **商品图片管理**
  - 主图上传
  - 商品相册（最多5张）
- ✅ **SKU 规格管理**
  - 启用/禁用规格
  - 动态添加规格属性（如：颜色、尺寸）
  - 自动生成 SKU 组合（笛卡尔积）
  - SKU 价格、库存、编码设置
- ✅ 商品详情（描述、HTML 详情）
- ✅ 其他设置（上架、推荐、新品）

**技术实现：**
```javascript
// SKU 生成逻辑
const generateSkuList = () => {
  const validSpecs = form.specs.filter(spec => spec.name && spec.values.length > 0)
  const combinations = cartesian(...validSpecs.map(spec => spec.values))
  
  skuList.value = combinations.map(combo => ({
    ...skuData,
    price: form.price,
    stock: form.stock,
    skuCode: ''
  }))
}
```

#### 1.2 商品列表优化
- ✅ 移除了内联编辑对话框
- ✅ 点击"编辑"跳转到独立编辑页面
- ✅ 点击"添加商品"跳转到独立编辑页面

---

### 2. 退款管理 ✅

#### 2.1 退款列表页面（Refunds.vue）
**路径：** `/refunds`

**功能特性：**
- ✅ 退款列表展示
  - 退款单号
  - 关联订单号
  - 退款金额
  - 退款类型（仅退款/退货退款/换货）
  - 退款原因
  - 状态（待审核/审核通过/审核拒绝/已完成）
  - 申请时间
- ✅ 搜索筛选
  - 按退款单号搜索
  - 按状态筛选
- ✅ 退款详情查看
  - 完整退款信息
  - 凭证图片预览
  - 处理记录
- ✅ 退款审核
  - 通过/拒绝操作
  - 处理备注填写

**状态流转：**
```
待审核(0) → 审核通过(1) → 已完成(3)
          ↘ 审核拒绝(2)
```

---

### 3. 优惠券管理 ✅

#### 3.1 优惠券列表页面（Coupons.vue）
**路径：** `/coupons`

**功能特性：**
- ✅ 优惠券列表展示
  - 优惠券名称
  - 类型（满减券/折扣券/无门槛券）
  - 优惠额度
  - 使用门槛
  - 发放数量/已领取/已使用
  - 有效期
- ✅ 搜索筛选
  - 按名称搜索
  - 按类型筛选
- ✅ 优惠券创建/编辑
  - 基本信息设置
  - 优惠类型选择
  - 优惠额度设置（满减金额/折扣比例）
  - 使用门槛设置
  - 发放数量限制
  - 每人限领数量
  - 有效期设置
  - 使用说明
- ✅ 优惠券删除

**优惠券类型：**
```javascript
0: 满减券 - 满 X 元减 Y 元
1: 折扣券 - X 折优惠（0.1-1.0）
2: 无门槛券 - 直接减 X 元
```

---

### 4. 路由配置更新 ✅

**新增路由：**
```javascript
{
  path: 'products/edit',
  name: 'ProductEdit',
  component: () => import('../views/ProductEdit.vue'),
  meta: { title: '编辑商品' }
},
{
  path: 'refunds',
  name: 'Refunds',
  component: () => import('../views/Refunds.vue'),
  meta: { title: '退款管理' }
},
{
  path: 'coupons',
  name: 'Coupons',
  component: () => import('../views/Coupons.vue'),
  meta: { title: '优惠券管理' }
}
```

---

### 5. 侧边栏菜单更新 ✅

**菜单顺序：**
1. 商品管理
2. 分类管理
3. 订单管理
4. 退款管理 ⭐ 新增
5. 优惠券管理 ⭐ 新增

---

### 6. API 接口封装 ✅

#### 6.1 退款 API（refund.js）
```javascript
- getRefunds(params)      // 获取退款列表
- getRefund(id)           // 获取退款详情
- reviewRefund(id, data)  // 审核退款
```

#### 6.2 优惠券 API（coupon.js）
```javascript
- getCoupons(params)      // 获取优惠券列表
- getCoupon(id)           // 获取优惠券详情
- createCoupon(data)      // 创建优惠券
- updateCoupon(id, data)  // 更新优惠券
- deleteCoupon(id)        // 删除优惠券
```

---

## 🎯 核心功能亮点

### 1. SKU 规格管理 ⭐⭐⭐⭐⭐

**功能描述：**
- 支持多规格商品（如：颜色、尺寸、版本等）
- 自动生成所有 SKU 组合
- 独立设置每个 SKU 的价格和库存

**使用场景：**
```
商品：iPhone 15
规格1：颜色 - 黑色、白色、蓝色
规格2：容量 - 128GB、256GB、512GB

自动生成 9 个 SKU：
- 黑色-128GB
- 黑色-256GB
- 黑色-512GB
- 白色-128GB
- ...
```

**技术实现：**
- 使用笛卡尔积算法生成所有组合
- 响应式监听规格变化，自动更新 SKU 列表
- 支持动态添加/删除规格

### 2. 商品分类关联 ⭐⭐⭐⭐

**功能描述：**
- 使用级联选择器选择商品分类
- 支持多级分类结构
- 严格模式：可选择任意级别的分类

**技术实现：**
```vue
<el-cascader
  v-model="form.categoryId"
  :options="categoryOptions"
  :props="{ 
    value: '_id', 
    label: 'name', 
    children: 'children', 
    checkStrictly: true 
  }"
/>
```

### 3. 商品相册管理 ⭐⭐⭐⭐

**功能描述：**
- 主图上传（必填）
- 商品相册（最多5张）
- 图片预览和删除

**技术实现：**
- 使用 Element Plus Upload 组件
- 支持拖拽上传
- 图片格式验证
- 大小限制（2MB）

### 4. 退款审核流程 ⭐⭐⭐⭐

**功能描述：**
- 查看退款详情（包括凭证图片）
- 审核通过/拒绝
- 填写处理备注
- 状态自动流转

**业务流程：**
```
用户申请退款 → 待审核
              ↓
管理员审核 → 审核通过 → 财务处理 → 已完成
          ↘ 审核拒绝
```

### 5. 优惠券系统 ⭐⭐⭐⭐⭐

**功能描述：**
- 三种优惠券类型
- 灵活的使用门槛设置
- 发放数量和领取限制
- 有效期管理

**优惠计算逻辑：**
```javascript
// 满减券
if (orderAmount >= minPoint) {
  discount = amount
}

// 折扣券
if (orderAmount >= minPoint) {
  discount = orderAmount * (1 - amount)
}

// 无门槛券
discount = amount
```

---

## 📝 使用说明

### 1. 创建带 SKU 的商品

1. 进入商品管理 → 点击"添加商品"
2. 填写基本信息（名称、分类、价格等）
3. 启用"启用规格"开关
4. 添加规格：
   - 点击"添加规格"
   - 输入规格名（如：颜色）
   - 输入规格值（如：红色、蓝色）
5. 系统自动生成 SKU 列表
6. 为每个 SKU 设置价格和库存
7. 提交保存

### 2. 处理退款申请

1. 进入退款管理
2. 查看待审核的退款申请
3. 点击"查看"查看详情
4. 点击"通过"或"拒绝"
5. 填写处理备注
6. 确认提交

### 3. 创建优惠券

1. 进入优惠券管理 → 点击"添加优惠券"
2. 填写优惠券信息：
   - 名称（如：新人专享券）
   - 类型（满减/折扣/无门槛）
   - 优惠额度
   - 使用门槛
   - 发放数量
   - 每人限领
   - 有效期
3. 提交保存

---

## 🔧 技术要点

### 1. 笛卡尔积算法

```javascript
const cartesian = (...arrays) => {
  return arrays.reduce((acc, array) => {
    return acc.flatMap(x => array.map(y => [...x, y]))
  }, [[]])
}

// 示例
cartesian(['红', '蓝'], ['S', 'M', 'L'])
// 结果：[['红','S'], ['红','M'], ['红','L'], ['蓝','S'], ['蓝','M'], ['蓝','L']]
```

### 2. 图片上传处理

```javascript
const handleMainImageUpload = async ({ file }) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.pic = e.target.result
  }
  reader.readAsDataURL(file)
}
```

### 3. 级联选择器配置

```javascript
:props="{ 
  value: '_id',           // 值字段
  label: 'name',          // 显示字段
  children: 'children',   // 子节点字段
  checkStrictly: true     // 严格模式，可选任意级别
}"
```

---

## 🚀 后续优化建议

### 1. 图片上传优化
- [ ] 集成云存储服务（阿里云 OSS/腾讯云 COS）
- [ ] 图片压缩和裁剪
- [ ] 批量上传

### 2. 富文本编辑器
- [ ] 集成富文本编辑器（Quill/TinyMCE）
- [ ] 支持图片、视频插入
- [ ] 支持表格、代码块

### 3. 数据统计
- [ ] 商品销量统计
- [ ] 退款率统计
- [ ] 优惠券使用率统计

### 4. 批量操作
- [ ] 批量上架/下架商品
- [ ] 批量修改价格
- [ ] 批量导入商品

### 5. 权限管理
- [ ] 角色管理
- [ ] 权限分配
- [ ] 操作日志

---

## 📊 功能对比

| 功能 | 之前 | 现在 |
|------|------|------|
| 商品编辑 | 简单对话框 | 独立页面，功能完整 |
| 分类关联 | ❌ 无 | ✅ 级联选择器 |
| SKU 管理 | ❌ 无 | ✅ 完整的 SKU 系统 |
| 商品相册 | ❌ 无 | ✅ 支持多图上传 |
| 退款管理 | ❌ 无 | ✅ 完整的审核流程 |
| 优惠券管理 | ❌ 无 | ✅ 三种类型优惠券 |

---

**文档维护者：** 开发团队  
**最后更新：** 2026-03-06  
**版本：** v1.1.0
