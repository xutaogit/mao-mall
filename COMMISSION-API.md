# 佣金和提现功能 API 文档

## 基础信息

- 基础 URL: `http://localhost:3001/api`
- 认证方式: Bearer Token (在 Authorization header 中)
- 响应格式: JSON

## 分销员相关 API

### 1. 申请成为分销员

```
POST /distributor/apply
```

**请求体：**
```json
{
  "phone": "13800138000"
}
```

**响应：**
```json
{
  "success": true,
  "message": "申请提交成功，请等待审核",
  "data": {
    "_id": "...",
    "memberId": "...",
    "phone": "13800138000",
    "status": 0,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**状态码：**
- 200: 成功
- 400: 参数错误或已申请过
- 500: 服务器错误

---

### 2. 获取分销员信息

```
GET /distributor/info
```

**响应：**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "memberId": "...",
    "phone": "13800138000",
    "status": 1,
    "distributorCode": "DIST1234567890",
    "totalCommission": 500,
    "totalOrders": 10,
    "totalCustomers": 5
  }
}
```

---

### 3. 获取分销中心数据

```
GET /distributor/center
```

**响应：**
```json
{
  "success": true,
  "data": {
    "totalCommission": 500,
    "todayCommission": 50,
    "totalOrders": 10,
    "totalCustomers": 5,
    "distributorCode": "DIST1234567890"
  }
}
```

---

### 4. 获取佣金明细

```
GET /distributor/orders?page=1&pageSize=10
```

**查询参数：**
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 10）
- `settlementStatus`: 结算状态（可选）
  - 0: 待结算
  - 1: 已结算
  - 2: 结算失败
  - 3: 已取消

**响应：**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "_id": "...",
        "orderId": "...",
        "orderSn": "ORD1234567890",
        "productId": {
          "_id": "...",
          "name": "iPhone 15",
          "pic": "..."
        },
        "orderAmount": 500,
        "commissionAmount": 50,
        "commissionType": 0,
        "settlementStatus": 1,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 10,
    "totalPage": 1
  }
}
```

---

### 5. 绑定分销关系

```
POST /distributor/bind
```

**请求体：**
```json
{
  "distributorCode": "DIST1234567890"
}
```

**响应：**
```json
{
  "success": true,
  "message": "绑定成功"
}
```

---

### 6. 获取商品佣金信息

```
GET /distributor/product/{productId}/commission
```

**响应：**
```json
{
  "success": true,
  "data": {
    "commissionType": 0,
    "commissionValue": 5
  }
}
```

---

## 提现相关 API

### 1. 申请提现

```
POST /withdrawal/apply
```

**请求体：**
```json
{
  "amount": 50,
  "bankAccount": "6222020xxxxxxxx",
  "bankName": "中国工商银行",
  "accountHolder": "张三"
}
```

**响应：**
```json
{
  "success": true,
  "message": "提现申请已提交，请等待审核",
  "data": {
    "_id": "...",
    "distributorId": "...",
    "amount": 50,
    "bankAccount": "6222020xxxxxxxx",
    "bankName": "中国工商银行",
    "accountHolder": "张三",
    "status": 0,
    "applyTime": "2024-01-15T15:00:00Z"
  }
}
```

---

### 2. 获取提现记录

```
GET /withdrawal/records?page=1&pageSize=10
```

**查询参数：**
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 10）

**响应：**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "_id": "...",
        "amount": 50,
        "bankAccount": "6222020xxxxxxxx",
        "bankName": "中国工商银行",
        "accountHolder": "张三",
        "status": 0,
        "applyTime": "2024-01-15T15:00:00Z",
        "reviewTime": null,
        "completeTime": null
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPage": 1
  }
}
```

---

### 3. 获取提现统计

```
GET /withdrawal/summary
```

**响应：**
```json
{
  "success": true,
  "data": {
    "totalCommission": 500,
    "pendingSettlement": 100,
    "availableWithdrawal": 400,
    "withdrawnAmount": 50
  }
}
```

---

## 管理员 API

### 分销员管理

#### 1. 获取分销员申请列表

```
GET /admin/distributor/applications?page=1&pageSize=10&status=0
```

**查询参数：**
- `page`: 页码
- `pageSize`: 每页数量
- `status`: 申请状态（0=待审核, 1=已通过, 2=已拒绝）

**响应：**
```json
{
  "success": true,
  "data": {
    "list": [...],
    "total": 5,
    "page": 1,
    "pageSize": 10,
    "totalPage": 1
  }
}
```

---

#### 2. 审核分销员申请

```
POST /admin/distributor/review/{distributorId}
```

**请求体：**
```json
{
  "approved": true,
  "rejectReason": ""
}
```

**响应：**
```json
{
  "success": true,
  "message": "审核通过",
  "data": {
    "_id": "...",
    "status": 1,
    "distributorCode": "DIST1234567890",
    "reviewTime": "2024-01-15T11:00:00Z"
  }
}
```

---

### 提现管理

#### 1. 获取提现申请列表

```
GET /admin/withdrawal/applications?page=1&pageSize=10&status=0
```

**查询参数：**
- `page`: 页码
- `pageSize`: 每页数量
- `status`: 申请状态（0=待审核, 1=已批准, 2=已拒绝, 3=已完成）

**响应：**
```json
{
  "success": true,
  "data": {
    "list": [...],
    "total": 5,
    "page": 1,
    "pageSize": 10,
    "totalPage": 1
  }
}
```

---

#### 2. 审核提现申请

```
POST /admin/withdrawal/review/{withdrawalId}
```

**请求体：**
```json
{
  "approved": true,
  "remark": "审核通过"
}
```

**响应：**
```json
{
  "success": true,
  "message": "已批准",
  "data": {
    "_id": "...",
    "status": 1,
    "reviewTime": "2024-01-15T15:30:00Z"
  }
}
```

---

#### 3. 标记提现已完成

```
POST /admin/withdrawal/complete/{withdrawalId}
```

**响应：**
```json
{
  "success": true,
  "message": "提现已完成",
  "data": {
    "_id": "...",
    "status": 3,
    "completeTime": "2024-01-15T16:00:00Z"
  }
}
```

---

### 佣金结算管理

#### 1. 获取待结算订单

```
GET /admin/settlement/pending?page=1&pageSize=10&distributorId=
```

**查询参数：**
- `page`: 页码
- `pageSize`: 每页数量
- `distributorId`: 分销员 ID（可选）

**响应：**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "_id": "...",
        "orderSn": "ORD1234567890",
        "distributorId": {
          "_id": "...",
          "phone": "13800138000",
          "distributorCode": "DIST1234567890"
        },
        "customerId": {
          "_id": "...",
          "nickname": "用户B"
        },
        "productId": {
          "_id": "...",
          "name": "iPhone 15"
        },
        "orderAmount": 500,
        "commissionAmount": 50,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 10,
    "totalPage": 1
  }
}
```

---

#### 2. 批量结算佣金

```
POST /admin/settlement/settle
```

**请求体：**
```json
{
  "orderIds": ["ObjectId1", "ObjectId2", "ObjectId3"]
}
```

**响应：**
```json
{
  "success": true,
  "message": "成功结算 3 条订单",
  "data": {
    "modifiedCount": 3
  }
}
```

---

#### 3. 获取结算统计

```
GET /admin/settlement/statistics
```

**响应：**
```json
{
  "success": true,
  "data": {
    "pendingCount": 10,
    "pendingAmount": 500,
    "settledCount": 50,
    "settledAmount": 2500,
    "failedCount": 2,
    "failedAmount": 100
  }
}
```

---

## 错误响应

所有 API 在出错时返回以下格式：

```json
{
  "success": false,
  "message": "错误描述信息"
}
```

**常见错误：**

| 错误信息 | 原因 | 解决方案 |
|---------|------|--------|
| 您还不是分销员 | 用户未申请或申请未通过 | 先申请成为分销员 |
| 您的分销员资格未通过审核 | 分销员申请未审核通过 | 等待管理员审核 |
| 提现金额不合法 | 提现金额 ≤ 0 | 输入有效的提现金额 |
| 可提现金额为¥X.XX | 提现金额超过可提现额度 | 减少提现金额 |
| 分销员不存在或未激活 | 分销员代码无效 | 检查分销员代码 |
| 不能绑定自己为分销员 | 尝试绑定自己 | 使用其他分销员的代码 |

---

## 认证

所有需要认证的 API 都需要在请求头中包含 Bearer Token：

```
Authorization: Bearer {token}
```

获取 token 的方式：

```
POST /auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

响应中的 `token` 字段即为 Bearer Token。

---

## 数据模型

### Distributor（分销员）

```javascript
{
  _id: ObjectId,
  memberId: ObjectId,           // 关联的用户ID
  phone: String,                // 手机号
  status: Number,               // 0=待审核, 1=已通过, 2=已拒绝
  rejectReason: String,         // 拒绝原因
  reviewerId: ObjectId,         // 审核人ID
  reviewTime: Date,             // 审核时间
  distributorCode: String,      // 分销员代码（唯一）
  totalCommission: Number,      // 累计佣金
  totalOrders: Number,          // 累计订单数
  totalCustomers: Number,       // 累计推广人数
  createdAt: Date,
  updatedAt: Date
}
```

### DistributionRelation（分销关系）

```javascript
{
  _id: ObjectId,
  customerId: ObjectId,         // 消费者ID
  distributorId: ObjectId,      // 分销员ID
  bindTime: Date,               // 绑定时间
  expireTime: Date,             // 过期时间（30天）
  source: String,               // 来源（link/qrcode）
  createdAt: Date,
  updatedAt: Date
}
```

### DistributionOrder（分销订单）

```javascript
{
  _id: ObjectId,
  orderId: ObjectId,            // 订单ID
  orderSn: String,              // 订单号
  distributorId: ObjectId,      // 分销员ID
  customerId: ObjectId,         // 消费者ID
  productId: ObjectId,          // 商品ID
  skuId: ObjectId,              // SKU ID（可选）
  orderAmount: Number,          // 订单金额
  commissionAmount: Number,     // 佣金金额
  commissionType: Number,       // 0=固定金额, 1=百分比
  settlementStatus: Number,     // 0=待结算, 1=已结算, 2=失败, 3=取消
  settlementTime: Date,         // 结算时间
  profitSharingOrderNo: String, // 微信分账单号
  failReason: String,           // 失败原因
  createdAt: Date,
  updatedAt: Date
}
```

### Withdrawal（提现申请）

```javascript
{
  _id: ObjectId,
  distributorId: ObjectId,      // 分销员ID
  amount: Number,               // 提现金额
  bankAccount: String,          // 银行卡号
  bankName: String,             // 开户银行
  accountHolder: String,        // 收款人姓名
  status: Number,               // 0=待审核, 1=已批准, 2=已拒绝, 3=已完成
  applyTime: Date,              // 申请时间
  reviewTime: Date,             // 审核时间
  reviewerId: ObjectId,         // 审核人ID
  completeTime: Date,           // 完成时间
  remark: String,               // 备注
  failReason: String,           // 拒绝原因
  createdAt: Date,
  updatedAt: Date
}
```

### ProductCommission（商品佣金）

```javascript
{
  _id: ObjectId,
  productId: ObjectId,          // 商品ID
  skuId: ObjectId,              // SKU ID（可选）
  commissionType: Number,       // 0=固定金额, 1=百分比
  commissionValue: Number,      // 佣金值
  enabled: Boolean,             // 是否启用
  createdAt: Date,
  updatedAt: Date
}
```

---

## 使用示例

### 完整的分销流程示例

```bash
# 1. 用户A申请成为分销员
curl -X POST http://localhost:3001/api/distributor/apply \
  -H "Authorization: Bearer {tokenA}" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000"}'

# 2. 管理员审核（获取distributorId）
curl -X POST http://localhost:3001/api/admin/distributor/review/{distributorId} \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{"approved": true}'

# 3. 用户B绑定分销关系
curl -X POST http://localhost:3001/api/distributor/bind \
  -H "Authorization: Bearer {tokenB}" \
  -H "Content-Type: application/json" \
  -d '{"distributorCode": "DIST1234567890"}'

# 4. 用户B购买商品并确认收货
# （自动生成佣金）

# 5. 管理员查看待结算订单
curl -X GET http://localhost:3001/api/admin/settlement/pending \
  -H "Authorization: Bearer {adminToken}"

# 6. 管理员批量结算
curl -X POST http://localhost:3001/api/admin/settlement/settle \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{"orderIds": ["ObjectId1", "ObjectId2"]}'

# 7. 用户A申请提现
curl -X POST http://localhost:3001/api/withdrawal/apply \
  -H "Authorization: Bearer {tokenA}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "bankAccount": "6222020xxxxxxxx",
    "bankName": "中国工商银行",
    "accountHolder": "张三"
  }'

# 8. 管理员审核提现
curl -X POST http://localhost:3001/api/admin/withdrawal/review/{withdrawalId} \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{"approved": true}'

# 9. 管理员标记提现完成
curl -X POST http://localhost:3001/api/admin/withdrawal/complete/{withdrawalId} \
  -H "Authorization: Bearer {adminToken}"
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2024-01-15 | 初始版本 |


