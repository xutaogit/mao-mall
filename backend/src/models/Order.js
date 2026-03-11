import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderSn: {
    type: String,
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  memberUsername: String,
  totalAmount: {
    type: Number,
    required: true
  },
  payAmount: Number,
  payType: {
    type: Number,
    enum: [0, 1, 2] // 0:未支付 1:支付宝 2:微信
  },
  status: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3, 4] // 0:待付款 1:待发货 2:已发货 3:已完成 4:已关闭
  },
  receiverName: {
    type: String,
    required: true
  },
  receiverPhone: {
    type: String,
    required: true
  },
  receiverProvince: String,
  receiverCity: String,
  receiverRegion: String,
  receiverDetailAddress: String,
  note: String,
  deliveryCompany: String,
  deliverySn: String,
  paymentTime: Date,
  deliveryTime: Date,
  receiveTime: Date
}, {
  timestamps: true
});

// 索引
orderSchema.index({ memberId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderSn: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
