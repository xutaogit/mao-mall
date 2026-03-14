import mongoose from 'mongoose';

// 分销关系表
const distributionRelationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Distributor',
    required: true
  },
  bindTime: {
    type: Date,
    default: Date.now
  },
  expireTime: {
    type: Date,
    required: true // 绑定有效期30天
  },
  source: {
    type: String,
    default: 'link' // link:链接 qrcode:二维码
  }
}, {
  timestamps: true
});

// 索引
distributionRelationSchema.index({ customerId: 1 });
distributionRelationSchema.index({ distributorId: 1 });
distributionRelationSchema.index({ expireTime: 1 });

// 复合唯一索引：一个用户同一时间只能绑定一个分销员
distributionRelationSchema.index({ customerId: 1, expireTime: 1 }, { unique: true });

const DistributionRelation = mongoose.model('DistributionRelation', distributionRelationSchema);

export default DistributionRelation;
