# 佣金和提现功能快速启动指南

## 功能概览

本项目实现了完整的分销佣金系统，包括：

- ✅ 分销员申请和审核
- ✅ 分销关系绑定（30天有效期）
- ✅ 订单确认收货时自动生成佣金
- ✅ 管理员批量结算佣金
- ✅ 分销员提现申请和审核
- ✅ 完整的数据统计和展示

## 快速开始

### 1. 后端配置

确保以下文件已创建：

```
backend/src/
├── models/
│   ├── Distributor.js           ✅ 分销员模型
│   ├── DistributionRelation.js  ✅ 分销关系模型
│   ├── DistributionOrder.js     ✅ 分销订单模型
│   ├── ProductCommission.js     ✅ 商品佣金模型
│   └── Withdrawal.js            ✅ 提现申请模型
├── routes/
│   ├── orders.js                ✅ 订单路由（已更新）
│   ├── distributor.js           ✅ 分销员路由
│   ├── distributorAdmin.js      ✅ 分销员管理路由
│   ├── withdrawals.js           ✅ 提现路由
│   └── settlement.js            ✅ 结算管理路由
└── index.js                     ✅ 主应用（已更新）
```

### 2. 前端配置

确保以下文件已创建：

```
frontend/src/
├── views/
│   ├── DistributorApply.vue     ✅ 分销员申请页面
│   ├── DistributionCenter.vue   ✅ 分销中心页面
│   ├── Withdrawal.vue           ✅ 提现页面
│   └── SettlementAdmin.vue      ✅ 结算管理页面
└── router/
    └── index.js                 ✅ 路由配置（已更新）
```

### 3. 启动服务

```bash
# 启动后端
cd backend
npm install
npm run dev

# 启动前端（新终端）
cd frontend
npm install
npm run dev
```

## 核心功能说明

### 功能 1: 分销员申请

**用户操作：**
1. 登录账号
2. 访问 `/distributor/apply`
3. 填写手机号并提交

**后端处理：**
- 创建 Distributor 记录，status=0（待审核）
- 发送通知给管理员

**管理员操作：**
1. 访问 `/admin/distributor/applications`
2. 查看待审核申请
3. 点击"批准"或"拒绝"

**后端处理：**
- 更新 Distributor 状态为 1（已通过）
- 生成唯一的分销员代码（DIST + 时间戳）

### 功能 2: 分销关系绑定

**用户操作：**
1. 消费者登录
2. 点击分销员的推广链接或输入分销员代码
3. 系统自动绑定

**后端处理：**
- 创建 DistributionRelation 记录
- 设置有效期为 30 天
- 更新分销员的推广人数

**关键点：**
- 最后点击有效原则（同一消费者可重新绑定）
- 30 天后自动失效

### 功能 3: 佣金自动生成

**触发条件：**
- 订单状态从"已发货"变为"已完成"
- 消费者点击"确认收货"按钮

**后端处理流程：**

```javascript
// 1. 查找消费者的有效分销关系
const relation = await DistributionRelation.findOne({
  customerId: order.memberId,
  expireTime: { $gt: new Date() }
});

// 2. 对每个订单商品查询佣金配置
const commission = await ProductCommission.findOne({
  productId: item.productId,
  enabled: true
});

// 3. 计算佣金金额
if (commission.commissionType === 0) {
  // 固定金额：5元/件
  commissionAmount = 5 * quantity;
} else {
  // 百分比：10% 的订单金额
  commissionAmount = (price * quantity) * 0.1;
}

// 4. 创建分销订单记录
const distributionOrder = new DistributionOrder({
  orderId: order._id,
  distributorId: relation.distributorId,
  customerId: order.memberId,
  commissionAmount,
  settlementStatus: 0  // 待结算
});

// 5. 更新分销员统计
await Distributor.findByIdAndUpdate(relation.distributorId, {
  $inc: { totalOrders: 1, totalCommission: commissionAmount }
});
```

**日志输出：**
```
✅ 分销佣金生成: 订单ORD1234567890, 商品iPhone 15, 佣金¥50.00
```

### 功能 4: 佣金结算

**管理员操作：**
1. 访问 `/settlement-admin`
2. 查看待结算订单列表
3. 选择订单并点击"结算"

**后端处理：**
- 更新 DistributionOrder 的 settlementStatus 为 1（已结算）
- 记录结算时间
- 更新分销员的累计佣金

**结算流程：**
```
待结算(0) → 已结算(1) → 可提现
```

### 功能 5: 提现申请

**分销员操作：**
1. 访问 `/withdrawal`
2. 查看可提现金额
3. 填写提现信息：
   - 提现金额
   - 收款人姓名
   - 开户银行
   - 银行卡号
4. 提交申请

**后端处理：**
- 验证可提现金额是否足够
- 创建 Withdrawal 记录，status=0（待审核）

**管理员操作：**
1. 访问 `/admin/withdrawal/applications`
2. 查看待审核申请
3. 点击"批准"或"拒绝"
4. 如果批准，点击"标记已完成"

**提现流程：**
```
申请(0) → 批准(1) → 完成(3)
       ↘ 拒绝(2)
```

## 数据流向图

```
┌─────────────────────────────────────────────────────────────┐
│                     分销佣金系统数据流                        │
└─────────────────────────────────────────────────────────────┘

1. 分销员申请
   用户 → POST /distributor/apply → Distributor(status=0)

2. 管理员审核
   管理员 → POST /admin/distributor/review → Distributor(status=1)
   生成分销员代码

3. 消费者绑定
   消费者 → POST /distributor/bind → DistributionRelation
   有效期30天

4. 订单流程
   消费者购买 → 支付 → 发货 → 确认收货
                              ↓
                        自动生成佣金
                              ↓
                    DistributionOrder(status=0)

5. 佣金结算
   管理员 → POST /admin/settlement/settle
   DistributionOrder(status=0) → DistributionOrder(status=1)
   Distributor.totalCommission += commissionAmount

6. 提现申请
   分销员 → POST /withdrawal/apply → Withdrawal(status=0)

7. 提现审核
   管理员 → POST /admin/withdrawal/review → Withdrawal(status=1)
   管理员 → POST /admin/withdrawal/complete → Withdrawal(status=3)
```

## 配置示例

### 商品佣金配置

在数据库中插入商品佣金配置：

```javascript
// 固定金额佣金：每件商品5元
db.productcommissions.insertOne({
  productId: ObjectId("..."),
  skuId: null,
  commissionType: 0,
  commissionValue: 5,
  enabled: true
});

// 百分比佣金：订单金额的10%
db.productcommissions.insertOne({
  productId: ObjectId("..."),
  skuId: null,
  commissionType: 1,
  commissionValue: 10,
  enabled: true
});
```

## 常见操作

### 查看分销员信息

```bash
curl -X GET http://localhost:3001/api/distributor/info \
  -H "Authorization: Bearer {token}"
```

### 查看分销中心数据

```bash
curl -X GET http://localhost:3001/api/distributor/center \
  -H "Authorization: Bearer {token}"
```

### 查看佣金明细

```bash
curl -X GET http://localhost:3001/api/distributor/orders?page=1 \
  -H "Authorization: Bearer {token}"
```

### 查看提现统计

```bash
curl -X GET http://localhost:3001/api/withdrawal/summary \
  -H "Authorization: Bearer {token}"
```

### 管理员查看待结算订单

```bash
curl -X GET http://localhost:3001/api/admin/settlement/pending \
  -H "Authorization: Bearer {adminToken}"
```

### 管理员批量结算

```bash
curl -X POST http://localhost:3001/api/admin/settlement/settle \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{"orderIds": ["id1", "id2", "id3"]}'
```

## 测试场景

### 场景 1: 完整的分销流程

```
1. 用户A申请分销员
2. 管理员审核通过
3. 用户B绑定用户A
4. 用户B购买商品
5. 确认收货（自动生成佣金）
6. 管理员结算佣金
7. 用户A申请提现
8. 管理员审核并完成提现
```

### 场景 2: 多个订单批量结算

```
1. 用户A是分销员
2. 用户B、C、D分别购买商品
3. 都确认收货（生成3条佣金）
4. 管理员批量结算3条订单
5. 用户A的累计佣金增加
```

## 故障排查

### 问题：确认收货后没有生成佣金

**检查清单：**
- [ ] 用户是否有有效的分销关系（DistributionRelation）
- [ ] 分销关系是否过期（expireTime > 现在）
- [ ] 商品是否配置了佣金（ProductCommission）
- [ ] 后端日志中是否有错误信息

**解决方案：**
```javascript
// 检查分销关系
db.distributionrelations.findOne({
  customerId: ObjectId("..."),
  expireTime: { $gt: new Date() }
});

// 检查商品佣金
db.productcommissions.findOne({
  productId: ObjectId("..."),
  enabled: true
});
```

### 问题：佣金金额计算错误

**检查清单：**
- [ ] commissionType 是否正确（0=固定, 1=百分比）
- [ ] commissionValue 是否正确
- [ ] 订单商品价格和数量是否正确

**手动计算：**
```
固定金额：commissionValue × quantity
百分比：(price × quantity) × (commissionValue / 100)
```

### 问题：提现申请失败

**检查清单：**
- [ ] 分销员状态是否为"已通过"（status=1）
- [ ] 可提现金额是否足够
- [ ] 银行信息是否完整

## 性能优化建议

1. **索引优化**
   - DistributionRelation 添加 (customerId, expireTime) 复合索引
   - DistributionOrder 添加 (distributorId, settlementStatus) 复合索引

2. **批量操作**
   - 使用 updateMany 进行批量结算
   - 使用 aggregation 进行统计查询

3. **缓存策略**
   - 缓存分销员的统计数据
   - 缓存商品佣金配置

## 下一步

- [ ] 实现微信分账功能
- [ ] 添加佣金提醒通知
- [ ] 实现佣金报表导出
- [ ] 添加分销员排行榜
- [ ] 实现自动结算定时任务

## 支持

如有问题，请查看：
- 详细 API 文档：`COMMISSION-API.md`
- 完整测试指南：`COMMISSION-TEST-GUIDE.md`
- 后端日志：`backend/logs/`
- 前端控制台：浏览器开发者工具


