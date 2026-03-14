import mongoose from 'mongoose';

// 分销员表
const distributorSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    default: 0,
    enum: [0, 1, 2] // 0:待审核 1:已通过 2:已拒绝
  },
  rejectReason: String, // 拒绝原因
  reviewerId: mongoose.Schema.Types.ObjectId, // 审核人ID
  reviewTime: Date, // 审核时间
  distributorCode: {
    type: String,
    unique: true,
    sparse: true // 审核通过后才生成
  },
  totalCommission: {
    type: Number,
    default: 0 // 累计佣金
  },
  totalOrders: {
    type: Number,
    default: 0 // 累计订单数
  },
  totalCustomers: {
    type: Number,
    default: 0 // 累计推广人数
  }
}, {
  timestamps: true
});

// 索引
distributorSchema.index({ memberId: 1 });
distributorSchema.index({ status: 1 });
distributorSchema.index({ distributorCode: 1 });

const Distributor = mongoose.model('Distributor', distributorSchema);

export default Distributor;
