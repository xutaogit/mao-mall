import mongoose from 'mongoose';

// 分销订单表
const distributionOrderSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  orderSn: String,
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Distributor',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  skuId: mongoose.Schema.Types.ObjectId,
  orderAmount: {
    type: Number,
    required: true // 订单金额
  },
  commissionAmount: {
    type: Number,
    required: true // 佣金金额
  },
  commissionType: {
    type: Number,
    enum: [0, 1] // 0:固定金额 1:百分比
  },
  settlementStatus: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3] // 0:待结算 1:已结算 2:结算失败 3:已取消
  },
  settlementTime: Date,
  profitSharingOrderNo: String, // 微信分账单号
  failReason: String // 结算失败原因
}, {
  timestamps: true
});

// 索引
distributionOrderSchema.index({ orderId: 1 });
distributionOrderSchema.index({ distributorId: 1 });
distributionOrderSchema.index({ customerId: 1 });
distributionOrderSchema.index({ settlementStatus: 1 });
distributionOrderSchema.index({ createdAt: -1 });

const DistributionOrder = mongoose.model('DistributionOrder', distributionOrderSchema);

export default DistributionOrder;
