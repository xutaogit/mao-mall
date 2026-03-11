import mongoose from 'mongoose';

// 优惠券
const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: Number,
    default: 0,
    enum: [0, 1, 2] // 0:满减券 1:折扣券 2:无门槛券
  },
  amount: {
    type: Number,
    default: 0
  },
  minPoint: {
    type: Number,
    default: 0
  },
  platform: {
    type: Number,
    default: 0,
    enum: [0, 1, 2] // 0:全平台 1:指定分类 2:指定商品
  },
  count: {
    type: Number,
    default: 0
  },
  receiveCount: {
    type: Number,
    default: 0
  },
  useCount: {
    type: Number,
    default: 0
  },
  startTime: Date,
  endTime: Date,
  status: {
    type: Number,
    default: 0,
    enum: [0, 1] // 0:未发布 1:已发布
  },
  memberLevel: {
    type: Number,
    default: 0
  },
  publishCount: {
    type: Number,
    default: 1
  },
  useType: {
    type: Number,
    default: 0,
    enum: [0, 1] // 0:全场通用 1:指定分类
  },
  note: String,
  enableTime: Date
}, {
  timestamps: true
});

// 优惠券领取记录
const couponHistorySchema = new mongoose.Schema({
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  couponCode: {
    type: String,
    required: true
  },
  memberNickname: String,
  getType: {
    type: Number,
    default: 0,
    enum: [0, 1] // 0:主动领取 1:后台赠送
  },
  useStatus: {
    type: Number,
    default: 0,
    enum: [0, 1, 2] // 0:未使用 1:已使用 2:已过期
  },
  useTime: Date,
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  orderSn: String
}, {
  timestamps: true
});

// 索引
couponSchema.index({ status: 1 });
couponSchema.index({ startTime: 1, endTime: 1 });
couponHistorySchema.index({ couponId: 1 });
couponHistorySchema.index({ memberId: 1 });
couponHistorySchema.index({ couponCode: 1 });
couponHistorySchema.index({ useStatus: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
const CouponHistory = mongoose.model('CouponHistory', couponHistorySchema);

export { Coupon, CouponHistory };
