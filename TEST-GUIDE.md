# 🧪 猫商城功能测试文档

**测试版本：** v1.1.0  
**测试日期：** 2026-03-04  
**测试范围：** 第一阶段核心功能

---

## 📋 测试前准备

### 1. 修复 npm 权限
```bash
sudo chown -R 501:20 "/Users/sam/.npm"
```

### 2. 安装后端依赖
```bash
cd /Users/sam/project/mao-mall/backend
npm install jsonwebtoken bcryptjs
```

### 3. 启动服务

**终端 1 - 启动后端：**
```bash
cd /Users/sam/project/mao-mall/backend
node src/index.js
```

**终端 2 - 启动前端：**
```bash
cd /Users/sam/project/mao-mall/frontend
npm run dev
```

**终端 3 - 启动后台管理（可选）：**
```bash
cd /Users/sam/project/mao-mall/admin
npm run dev
```

### 4. 验证服务启动
```bash
# 检查后端
curl http://localhost:3000/health

# 检查前端
curl http://localhost:5173

# 检查后台
curl http://localhost:5174
```

---

## 🎯 测试清单

### 一、基础功能测试（已完成）

#### 1.1 用户认证 ✅
- [ ] 用户注册
- [ ] 用户登录
- [ ] 获取用户信息
- [ ] 修改用户信息
- [ ] 退出登录

#### 1.2 地址管理 ✅
- [ ] 添加地址
- [ ] 查看地址列表
- [ ] 编辑地址
- [ ] 删除地址
- [ ] 设置默认地址

#### 1.3 购物车 ✅
- [ ] 添加商品到购物车
- [ ] 查看购物车
- [ ] 修改商品数量
- [ ] 删除商品
- [ ] 全选/取消全选

#### 1.4 订单流程 ✅
- [ ] 创建订单
- [ ] 订单支付
- [ ] 查看订单列表
- [ ] 查看订单详情
- [ ] 取消订单
- [ ] 确认收货

---

### 二、新功能测试（第一阶段）

#### 2.1 商品 SKU 管理 ⭐ 新增

**测试目标：** 验证商品规格和 SKU 功能

**测试步骤：**

**步骤 1：添加商品规格**
```bash
# 为商品添加颜色规格
curl -X POST http://localhost:3000/api/sku/product/PRODUCT_ID/attributes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "颜色",
    "values": ["红色", "蓝色", "黑色"]
  }'

# 为商品添加尺寸规格
curl -X POST http://localhost:3000/api/sku/product/PRODUCT_ID/attributes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "尺寸",
    "values": ["S", "M", "L", "XL"]
  }'
```

**步骤 2：添加 SKU**
```bash
# 添加 SKU：红色-M
curl -X POST http://localhost:3000/api/sku/product/PRODUCT_ID/skus \
  -H "Content-Type: application/json" \
  -d '{
    "skuCode": "SKU001",
    "price": 199,
    "stock": 100,
    "lowStock": 10,
    "spData": [
      {"key": "颜色", "value": "红色"},
      {"key": "尺寸", "value": "M"}
    ]
  }'

# 添加 SKU：蓝色-L
curl -X POST http://localhost:3000/api/sku/product/PRODUCT_ID/skus \
  -H "Content-Type: application/json" \
  -d '{
    "skuCode": "SKU002",
    "price": 199,
    "stock": 50,
    "lowStock": 10,
    "spData": [
      {"key": "颜色", "value": "蓝色"},
      {"key": "尺寸", "value": "L"}
    ]
  }'
```

**步骤 3：查询 SKU**
```bash
# 获取商品的所有 SKU
curl http://localhost:3000/api/sku/product/PRODUCT_ID/skus

# 匹配特定规格的 SKU
curl -X POST http://localhost:3000/api/sku/product/PRODUCT_ID/sku/match \
  -H "Content-Type: application/json" \
  -d '{
    "spData": [
      {"key": "颜色", "value": "红色"},
      {"key": "尺寸", "value": "M"}
    ]
  }'
```

**步骤 4：更新 SKU**
```bash
# 更新 SKU 价格和库存
curl -X PUT http://localhost:3000/api/sku/skus/SKU_ID \
  -H "Content-Type: application/json" \
  -d '{
    "price": 179,
    "stock": 150
  }'
```

**预期结果：**
- ✅ 规格添加成功
- ✅ SKU 创建成功
- ✅ SKU 查询正常
- ✅ SKU 更新成功
- ✅ SKU 编码唯一性验证

**测试检查点：**
- [ ] 规格属性正确保存
- [ ] SKU 编码不能重复
- [ ] SKU 价格和库存正确
- [ ] 规格匹配功能正常
- [ ] 低库存预警设置有效

---

#### 2.2 订单退款/售后 ⭐ 新增

**测试目标：** 验证退款申请和处理流程

**前置条件：** 需要先创建并支付一个订单

**步骤 1：申请退款**
```bash
# 获取 token（先登录）
TOKEN="YOUR_TOKEN_HERE"

# 申请退款
curl -X POST http://localhost:3000/api/refund/apply \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "refundAmount": 199,
    "refundType": 0,
    "reason": "商品质量问题",
    "description": "收到商品有破损",
    "proofPics": ["https://example.com/pic1.jpg"]
  }'
```

**步骤 2：查看退款申请**
```bash
# 用户查看自己的退款申请
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/refund

# 查看退款详情
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/refund/REFUND_ID
```

**步骤 3：审核退款（管理员）**
```bash
# 审核通过
curl -X POST http://localhost:3000/api/refund/REFUND_ID/review \
  -H "Content-Type: application/json" \
  -d '{
    "status": 1,
    "handleNote": "同意退款"
  }'

# 审核拒绝
curl -X POST http://localhost:3000/api/refund/REFUND_ID/review \
  -H "Content-Type: application/json" \
  -d '{
    "status": 2,
    "handleNote": "不符合退款条件"
  }'
```

**步骤 4：完成退款（管理员）**
```bash
curl -X POST http://localhost:3000/api/refund/REFUND_ID/complete \
  -H "Content-Type: application/json"
```

**预期结果：**
- ✅ 退款申请提交成功
- ✅ 退款状态正确更新
- ✅ 审核通过后库存恢复（退货退款）
- ✅ 退款完成后订单状态变为已关闭

**测试检查点：**
- [ ] 只能对已支付订单申请退款
- [ ] 同一订单不能重复申请退款
- [ ] 退款类型正确（仅退款/退货退款/换货）
- [ ] 审核流程完整
- [ ] 库存恢复正确（退货退款时）
- [ ] 退款金额不能超过订单金额

---

#### 2.3 优惠券系统 ⭐ 新增

**测试目标：** 验证优惠券创建、领取和使用

**步骤 1：创建优惠券（管理员）**
```bash
# 创建满减券
curl -X POST http://localhost:3000/api/coupon \
  -H "Content-Type: application/json" \
  -d '{
    "name": "满100减20",
    "type": 0,
    "amount": 20,
    "minPoint": 100,
    "platform": 0,
    "count": 1000,
    "startTime": "2026-03-01T00:00:00Z",
    "endTime": "2026-12-31T23:59:59Z",
    "status": 1,
    "useType": 0,
    "note": "全场通用"
  }'

# 创建折扣券
curl -X POST http://localhost:3000/api/coupon \
  -H "Content-Type: application/json" \
  -d '{
    "name": "9折优惠券",
    "type": 1,
    "amount": 0.9,
    "minPoint": 0,
    "platform": 0,
    "count": 500,
    "startTime": "2026-03-01T00:00:00Z",
    "endTime": "2026-12-31T23:59:59Z",
    "status": 1,
    "useType": 0
  }'

# 创建无门槛券
curl -X POST http://localhost:3000/api/coupon \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新人专享10元券",
    "type": 2,
    "amount": 10,
    "minPoint": 0,
    "platform": 0,
    "count": 100,
    "startTime": "2026-03-01T00:00:00Z",
    "endTime": "2026-12-31T23:59:59Z",
    "status": 1,
    "useType": 0
  }'
```

**步骤 2：查看可领取的优惠券**
```bash
# 查看所有可用优惠券
curl "http://localhost:3000/api/coupon?available=true"
```

**步骤 3：领取优惠券**
```bash
TOKEN="YOUR_TOKEN_HERE"

# 领取优惠券
curl -X POST http://localhost:3000/api/coupon/COUPON_ID/claim \
  -H "Authorization: Bearer $TOKEN"
```

**步骤 4：查看我的优惠券**
```bash
# 查看所有优惠券
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/coupon/my/list"

# 查看未使用的优惠券
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/coupon/my/list?useStatus=0"

# 查看已使用的优惠券
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/coupon/my/list?useStatus=1"
```

**步骤 5：使用优惠券（创建订单时）**
```bash
# 使用优惠券
curl -X POST http://localhost:3000/api/coupon/use \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "COUPON_CODE",
    "orderId": "ORDER_ID",
    "orderSn": "ORDER_SN"
  }'
```

**预期结果：**
- ✅ 优惠券创建成功
- ✅ 优惠券领取成功
- ✅ 优惠券使用成功
- ✅ 优惠券状态正确更新

**测试检查点：**
- [ ] 优惠券类型正确（满减/折扣/无门槛）
- [ ] 优惠券有效期验证
- [ ] 优惠券库存限制
- [ ] 同一用户不能重复领取
- [ ] 优惠券使用后状态变为已使用
- [ ] 过期优惠券不能使用

---

#### 2.4 商品搜索和筛选 ⭐ 新增

**测试目标：** 验证商品搜索和多条件筛选

**步骤 1：关键词搜索**
```bash
# 搜索商品名称
curl "http://localhost:3000/api/products?keyword=手机"

# 搜索商品编号
curl "http://localhost:3000/api/products?keyword=PRD001"
```

**步骤 2：分类筛选**
```bash
# 按分类筛选
curl "http://localhost:3000/api/products?categoryId=CATEGORY_ID"
```

**步骤 3：价格区间筛选**
```bash
# 价格在 100-500 之间
curl "http://localhost:3000/api/products?minPrice=100&maxPrice=500"

# 价格大于 1000
curl "http://localhost:3000/api/products?minPrice=1000"

# 价格小于 200
curl "http://localhost:3000/api/products?maxPrice=200"
```

**步骤 4：状态筛选**
```bash
# 只看上架商品
curl "http://localhost:3000/api/products?publishStatus=1"

# 只看推荐商品
curl "http://localhost:3000/api/products?recommendStatus=1"

# 只看新品
curl "http://localhost:3000/api/products?newStatus=1"
```

**步骤 5：排序**
```bash
# 按价格升序
curl "http://localhost:3000/api/products?sort=price&order=asc"

# 按价格降序
curl "http://localhost:3000/api/products?sort=price&order=desc"

# 按销量降序
curl "http://localhost:3000/api/products?sort=sale&order=desc"

# 按创建时间降序（最新）
curl "http://localhost:3000/api/products?sort=createdAt&order=desc"
```

**步骤 6：组合筛选**
```bash
# 搜索 + 价格筛选 + 排序
curl "http://localhost:3000/api/products?keyword=手机&minPrice=1000&maxPrice=5000&sort=price&order=asc"

# 分类 + 状态 + 排序
curl "http://localhost:3000/api/products?categoryId=CATEGORY_ID&publishStatus=1&recommendStatus=1&sort=sale&order=desc"
```

**预期结果：**
- ✅ 关键词搜索准确
- ✅ 价格筛选正确
- ✅ 状态筛选有效
- ✅ 排序功能正常
- ✅ 组合筛选准确

**测试检查点：**
- [ ] 关键词搜索支持模糊匹配
- [ ] 价格区间筛选准确
- [ ] 多条件组合筛选正确
- [ ] 排序字段有效（价格、销量、时间）
- [ ] 分页功能正常

---

## 🌐 前端界面测试

### 访问地址
- **H5 商城：** http://localhost:5173
- **后台管理：** http://localhost:5174

### 测试流程

#### 1. 完整购物流程
1. 注册/登录
2. 浏览商品
3. 搜索商品（测试新功能）
4. 筛选商品（测试新功能）
5. 查看商品详情
6. 选择 SKU 规格（测试新功能）
7. 加入购物车
8. 查看购物车
9. 领取优惠券（测试新功能）
10. 创建订单
11. 使用优惠券（测试新功能）
12. 支付订单
13. 查看订单
14. 申请退款（测试新功能）

#### 2. 后台管理测试
1. 商品管理
   - 添加商品
   - 设置 SKU（测试新功能）
   - 上架/下架
2. 订单管理
   - 查看订单
   - 订单发货
   - 处理退款（测试新功能）
3. 优惠券管理（测试新功能）
   - 创建优惠券
   - 查看领取记录
   - 查看使用记录

---

## 📊 测试记录表

### 功能测试记录

| 功能模块 | 测试项 | 状态 | 备注 |
|---------|--------|------|------|
| SKU 管理 | 添加规格 | ⬜ |  |
| SKU 管理 | 添加 SKU | ⬜ |  |
| SKU 管理 | 查询 SKU | ⬜ |  |
| SKU 管理 | 更新 SKU | ⬜ |  |
| SKU 管理 | 匹配 SKU | ⬜ |  |
| 退款管理 | 申请退款 | ⬜ |  |
| 退款管理 | 审核退款 | ⬜ |  |
| 退款管理 | 完成退款 | ⬜ |  |
| 退款管理 | 库存恢复 | ⬜ |  |
| 优惠券 | 创建优惠券 | ⬜ |  |
| 优惠券 | 领取优惠券 | ⬜ |  |
| 优惠券 | 使用优惠券 | ⬜ |  |
| 优惠券 | 查看我的优惠券 | ⬜ |  |
| 商品搜索 | 关键词搜索 | ⬜ |  |
| 商品筛选 | 价格筛选 | ⬜ |  |
| 商品筛选 | 分类筛选 | ⬜ |  |
| 商品筛选 | 状态筛选 | ⬜ |  |
| 商品排序 | 价格排序 | ⬜ |  |
| 商品排序 | 销量排序 | ⬜ |  |

### Bug 记录

| Bug ID | 功能模块 | 问题描述 | 严重程度 | 状态 |
|--------|---------|---------|---------|------|
|  |  |  |  |  |

---

## 🐛 常见问题

### 1. npm 权限错误
```bash
sudo chown -R 501:20 "/Users/sam/.npm"
```

### 2. 端口被占用
```bash
# 查找占用端口的进程
lsof -ti:3000
lsof -ti:5173

# 关闭进程
kill -9 <PID>
```

### 3. Token 过期
重新登录获取新的 token

### 4. 数据库连接失败
检查 MongoDB 是否运行

---

## ✅ 测试完成标准

- [ ] 所有 API 接口测试通过
- [ ] 前端界面功能正常
- [ ] 无严重 Bug
- [ ] 性能测试通过
- [ ] 数据一致性验证通过

---

**开始测试吧！** 🚀

测试过程中发现问题请记录在 Bug 记录表中。
