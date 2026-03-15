import mongoose from 'mongoose';

// 提现申请表
const withdrawalSchema = new mongoose.Schema({
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Distributor',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  bankAccount: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  accountHolder: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3] // 0:待审核 1:已批准 2:已拒绝 3:已完成
  },
  applyTime: {
    type: Date,
    default: Date.now
  },
  reviewTime: Date,
  reviewerId: mongoose.Schema.Types.ObjectId,
  completeTime: Date,
  remark: String,
  failReason: String
}, {
  timestamps: true
});

// 索引
withdrawalSchema.index({ distributorId: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ applyTime: -1 });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;

