import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  nickname: String,
  phone: String,
  icon: String, // 头像
  gender: {
    type: Number,
    default: 0,
    enum: [0, 1, 2] // 0:未知 1:男 2:女
  },
  birthday: Date,
  city: String,
  email: String,
  status: {
    type: Number,
    default: 1,
    enum: [0, 1] // 0:禁用 1:启用
  }
}, {
  timestamps: true
});

// 收货地址模型
const memberAddressSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  detailAddress: {
    type: String,
    required: true
  },
  defaultStatus: {
    type: Number,
    default: 0,
    enum: [0, 1] // 0:非默认 1:默认
  }
}, {
  timestamps: true
});

// 索引
memberAddressSchema.index({ memberId: 1 });
memberAddressSchema.index({ defaultStatus: 1 });

const Member = mongoose.model('Member', memberSchema);
const MemberAddress = mongoose.model('MemberAddress', memberAddressSchema);

export default Member;
export { MemberAddress };
