import mongoose from 'mongoose';

// 退款申请
const orderRefundSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  refundSn: {
    type: String,
    required: true
  },
  refundAmount: {
    type: Number,
    required: true
  },
  refundType: {
    type: Number,
    default: 0,
    enum: [0, 1, 2] // 0:仅退款 1:退货退款 2:换货
  },
  status: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3] // 0:待审核 1:审核通过 2:审核拒绝 3:已完成
  },
  reason: {
    type: String,
    required: true
  },
  description: String,
  proofPics: [String], // 凭证图片
  handleNote: String, // 处理备注
  handleTime: Date,
  refundTime: Date
}, {
  timestamps: true
});

// 索引
orderRefundSchema.index({ orderId: 1 });
orderRefundSchema.index({ memberId: 1 });
orderRefundSchema.index({ refundSn: 1 });
orderRefundSchema.index({ status: 1 });

const OrderRefund = mongoose.model('OrderRefund', orderRefundSchema);

export default OrderRefund;
