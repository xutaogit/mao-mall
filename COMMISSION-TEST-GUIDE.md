# 佣金生成和提现功能完整测试指南

## 功能概述

本文档详细说明如何测试完整的分销佣金生成、结算和提现流程。

## 系统架构

```
订单确认收货 → 自动生成分销订单 → 管理员结算 → 分销员提现
```

## 前置条件

1. 后端服务运行在 `http://localhost:3001`
2. 前端服务运行在 `http://localhost:5173`
3. MongoDB 数据库已连接
4. 至少有 3 个测试用户账号

## 测试流程

### Phase 1: 分销员申请和审核

#### 1.1 用户申请成为分销员

**步骤：**
1. 登录用户账号 A（作为分销员）
2. 访问 `/distributor/apply` 页面
3. 填写手机号并提交申请
4. 验证申请成功提示

**预期结果：**
- 申请状态为"待审核"
- 数据库中创建 Distributor 记录，status=0

**API 调用：**
```bash
POST /api/distributor/apply
{
  "phone": "13800138000"
}
```

#### 1.2 管理员审核分销员申请

**步骤：**
1. 以管理员身份访问 `/admin/distributor/applications`
2. 查看待审核的申请列表
3. 点击"批准"按钮
4. 验证分销员代码生成

**预期结果：**
- 分销员状态变为"已通过"
- 生成唯一的分销员代码（DIST + 时间戳）
- 前端显示分销员代码

**API 调用：**
```bash
POST /api/admin/distributor/review/{distributorId}
{
  "approved": true
}
```

### Phase 2: 分销关系绑定

#### 2.1 用户 B 通过分销链接绑定

**步骤：**
1. 登录用户账号 B（作为消费者）
2. 从分销员 A 获取推广链接（包含分销员代码）
3. 点击链接或手动输入分销员代码
4. 系统自动绑定分销关系

**预期结果：**
- 创建 DistributionRelation 记录
- 绑定有效期为 30 天
- 分销员 A 的推广人数 +1

**API 调用：**
```bash
POST /api/distributor/bind
{
  "distributorCode": "DIST1234567890"
}
```

### Phase 3: 商品佣金配置

#### 3.1 管理员配置商品佣金

**步骤：**
1. 以管理员身份访问商品管理页面
2. 选择一个商品
3. 配置佣金信息：
   - 佣金类型：固定金额或百分比
   - 佣金值：例如 5 元或 10%
4. 保存配置

**预期结果：**
- 创建 ProductCommission 记录
- 佣金配置生效

**数据库操作：**
```javascript
db.productcommissions.insertOne({
  productId: ObjectId("..."),
  skuId: null,
  commissionType: 0,  // 0=固定金额, 1=百分比
  commissionValue: 5,  // 5元或5%
  enabled: true
})
```

### Phase 4: 订单流程和佣金生成

#### 4.1 用户 B 购买商品

**步骤：**
1. 登录用户账号 B
2. 浏览商品列表
3. 选择已配置佣金的商品
4. 加入购物车
5. 提交订单
6. 完成支付

**预期结果：**
- 订单状态为"待发货"（status=1）
- 订单中记录了分销关系

#### 4.2 管理员发货

**步骤：**
1. 以管理员身份访问订单管理
2. 找到用户 B 的订单
3. 点击"发货"按钮
4. 填写快递信息
5. 提交

**预期结果：**
- 订单状态变为"已发货"（status=2）
- 记录发货时间和快递信息

**API 调用：**
```bash
POST /api/orders/{orderId}/delivery
{
  "deliveryCompany": "顺丰快递",
  "deliverySn": "SF123456789"
}
```

#### 4.3 用户 B 确认收货

**步骤：**
1. 登录用户账号 B
2. 访问订单详情页面
3. 点击"确认收货"按钮
4. 验证订单状态变为"已完成"

**预期结果：**
- 订单状态变为"已完成"（status=3）
- **自动生成 DistributionOrder 记录**
- 佣金金额计算正确
- 分销员 A 的统计数据更新

**API 调用：**
```bash
POST /api/orders/{orderId}/confirm
```

**后端日志输出：**
```
✅ 分销佣金生成: 订单ORD1234567890, 商品iPhone 15, 佣金¥50.00
```

**数据库验证：**
```javascript
// 查看生成的分销订单
db.distributionorders.findOne({
  orderSn: "ORD1234567890"
})

// 输出示例：
{
  _id: ObjectId("..."),
  orderId: ObjectId("..."),
  orderSn: "ORD1234567890",
  distributorId: ObjectId("..."),  // 分销员A的ID
  customerId: ObjectId("..."),     // 用户B的ID
  productId: ObjectId("..."),
  orderAmount: 500,
  commissionAmount: 50,
  commissionType: 0,
  settlementStatus: 0,  // 待结算
  createdAt: ISODate("2024-01-15T10:30:00Z")
}
```

### Phase 5: 佣金结算

#### 5.1 管理员查看待结算订单

**步骤：**
1. 以管理员身份访问 `/settlement-admin` 页面
2. 查看"待结算订单"列表
3. 验证显示了用户 B 的订单

**预期结果：**
- 显示所有 settlementStatus=0 的订单
- 统计待结算金额

**API 调用：**
```bash
GET /api/admin/settlement/pending?page=1&pageSize=10
```

#### 5.2 管理员批量结算

**步骤：**
1. 在待结算订单列表中选择订单
2. 点击"结算选中的 X 条订单"按钮
3. 确认结算

**预期结果：**
- DistributionOrder 的 settlementStatus 变为 1（已结算）
- 分销员 A 的 totalCommission 增加
- 统计数据更新

**API 调用：**
```bash
POST /api/admin/settlement/settle
{
  "orderIds": ["ObjectId1", "ObjectId2"]
}
```

**数据库验证：**
```javascript
// 查看结算后的分销订单
db.distributionorders.findOne({
  orderSn: "ORD1234567890"
})

// settlementStatus 应为 1，settlementTime 已设置
{
  settlementStatus: 1,
  settlementTime: ISODate("2024-01-15T14:00:00Z")
}

// 查看分销员的累计佣金
db.distributors.findOne({
  _id: ObjectId("...")
})

// totalCommission 应增加 50
{
  totalCommission: 50,
  totalOrders: 1
}
```

### Phase 6: 分销员提现

#### 6.1 分销员查看提现信息

**步骤：**
1. 登录用户账号 A（分销员）
2. 访问 `/withdrawal` 页面
3. 查看统计信息：
   - 累计佣金
   - 待结算金额
   - 可提现金额
   - 已提现金额

**预期结果：**
- 可提现金额 = 已结算的佣金
- 显示正确的金额

**API 调用：**
```bash
GET /api/withdrawal/summary
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "totalCommission": 50,
    "pendingSettlement": 0,
    "availableWithdrawal": 50,
    "withdrawnAmount": 0
  }
}
```

#### 6.2 分销员申请提现

**步骤：**
1. 在提现页面填写提现信息：
   - 提现金额：50 元
   - 收款人姓名：张三
   - 开户银行：中国工商银行
   - 银行卡号：6222020xxxxxxxx
2. 点击"提交申请"
3. 验证提交成功

**预期结果：**
- 创建 Withdrawal 记录，status=0（待审核）
- 显示提现申请已提交
- 提现记录列表中显示新申请

**API 调用：**
```bash
POST /api/withdrawal/apply
{
  "amount": 50,
  "bankAccount": "6222020xxxxxxxx",
  "bankName": "中国工商银行",
  "accountHolder": "张三"
}
```

**数据库验证：**
```javascript
db.withdrawals.findOne({
  distributorId: ObjectId("...")
})

// 输出示例：
{
  _id: ObjectId("..."),
  distributorId: ObjectId("..."),
  amount: 50,
  bankAccount: "6222020xxxxxxxx",
  bankName: "中国工商银行",
  accountHolder: "张三",
  status: 0,  // 待审核
  applyTime: ISODate("2024-01-15T15:00:00Z")
}
```

#### 6.3 管理员审核提现申请

**步骤：**
1. 以管理员身份访问 `/admin/withdrawal/applications`
2. 查看待审核的提现申请
3. 点击"批准"或"拒绝"
4. 如果拒绝，填写拒绝原因

**预期结果：**
- 提现申请状态变为"已批准"或"已拒绝"
- 记录审核时间

**API 调用：**
```bash
POST /api/withdrawal/admin/review/{withdrawalId}
{
  "approved": true,
  "remark": "审核通过"
}
```

#### 6.4 管理员标记提现已完成

**步骤：**
1. 在已批准的提现申请中
2. 点击"标记已完成"
3. 确认

**预期结果：**
- 提现申请状态变为"已完成"
- 记录完成时间

**API 调用：**
```bash
POST /api/withdrawal/admin/complete/{withdrawalId}
```

### Phase 7: 分销中心数据展示

#### 7.1 分销员访问分销中心

**步骤：**
1. 登录用户账号 A（分销员）
2. 访问 `/distribution-center` 页面
3. 查看统计数据：
   - 累计佣金
   - 今日预估佣金
   - 推广订单数
   - 推广人数
4. 查看佣金明细列表

**预期结果：**
- 显示正确的统计数据
- 佣金明细列表显示所有订单
- 可按结算状态筛选

**API 调用：**
```bash
GET /api/distributor/center
GET /api/distributor/orders?page=1&pageSize=10
```

## 完整测试场景

### 场景 1: 单个订单完整流程

```
用户A申请分销员 → 审核通过 → 用户B绑定A → 用户B购买商品 → 
发货 → 确认收货 → 自动生成佣金 → 管理员结算 → 用户A提现 → 
管理员审核 → 标记完成
```

### 场景 2: 多个订单批量结算

```
用户A分销员 → 用户B、C、D分别购买商品 → 
确认收货（生成3条佣金记录） → 
管理员批量结算3条订单 → 
用户A提现总佣金
```

## 数据验证清单

- [ ] DistributionRelation 记录正确创建
- [ ] ProductCommission 配置正确
- [ ] DistributionOrder 在确认收货时自动生成
- [ ] 佣金金额计算正确
- [ ] Distributor 统计数据更新正确
- [ ] Withdrawal 记录正确创建
- [ ] 提现流程状态转换正确

## 常见问题排查

### 问题 1: 确认收货后没有生成佣金

**排查步骤：**
1. 检查用户是否有有效的分销关系
2. 检查商品是否配置了佣金
3. 查看后端日志是否有错误信息
4. 检查数据库中 DistributionRelation 是否存在且未过期

### 问题 2: 佣金金额计算错误

**排查步骤：**
1. 验证 ProductCommission 的 commissionType 和 commissionValue
2. 检查订单商品的价格和数量
3. 手动计算预期佣金金额
4. 对比数据库中的实际金额

### 问题 3: 提现申请失败

**排查步骤：**
1. 检查分销员状态是否为"已通过"
2. 验证可提现金额是否足够
3. 检查银行信息是否完整
4. 查看后端错误日志

## 性能测试

### 测试场景：大量订单结算

```bash
# 创建 1000 条待结算订单
# 批量结算所有订单
# 验证性能和数据一致性
```

## 总结

完整的佣金生成和提现功能包括：

1. **分销员管理**：申请、审核、代码生成
2. **分销关系**：绑定、有效期管理
3. **佣金生成**：订单确认收货时自动生成
4. **佣金结算**：管理员批量结算
5. **提现管理**：申请、审核、完成
6. **数据统计**：实时展示各类数据

所有功能已完整实现，可按照本指南进行测试。

