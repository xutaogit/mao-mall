import mongoose from 'mongoose';

// 商品佣金配置表
const productCommissionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  skuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductSku'
  },
  commissionType: {
    type: Number,
    default: 0,
    enum: [0, 1] // 0:固定金额 1:百分比
  },
  commissionValue: {
    type: Number,
    required: true // 固定金额（元）或百分比（0-100）
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 索引
productCommissionSchema.index({ productId: 1 });
productCommissionSchema.index({ skuId: 1 });
productCommissionSchema.index({ enabled: 1 });

// 复合唯一索引：同一商品/SKU只能有一条配置
productCommissionSchema.index({ productId: 1, skuId: 1 }, { unique: true, sparse: true });

const ProductCommission = mongoose.model('ProductCommission', productCommissionSchema);

export default ProductCommission;
