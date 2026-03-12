import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentSn: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderSn: String,
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  amount: {
    type: Number,
    required: true
  },
  payType: {
    type: Number,
    enum: [1, 2], // 1:支付宝 2:微信
    required: true
  },
  status: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3] // 0:待支付 1:支付中 2:已支付 3:支付失败
  },
  transactionId: String, // 第三方交易号
  paymentUrl: String, // 支付二维码/链接
  paymentTime: Date,
  remark: String
}, {
  timestamps: true
});

// 索引
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ memberId: 1 });
paymentSchema.index({ paymentSn: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
