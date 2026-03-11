import mongoose from 'mongoose';

// 商品规格（如颜色、尺寸）
const productAttributeSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  values: [{
    type: String
  }]
}, {
  timestamps: true
});

// SKU 库存
const skuStockSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  skuCode: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  lowStock: {
    type: Number,
    default: 0
  },
  pic: String,
  sale: {
    type: Number,
    default: 0
  },
  // 规格属性，如 [{"key": "颜色", "value": "红色"}, {"key": "尺寸", "value": "L"}]
  spData: [{
    key: String,
    value: String
  }],
  lockStock: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 索引
productAttributeSchema.index({ productId: 1 });
skuStockSchema.index({ productId: 1 });
skuStockSchema.index({ skuCode: 1 });

const ProductAttribute = mongoose.model('ProductAttribute', productAttributeSchema);
const SkuStock = mongoose.model('SkuStock', skuStockSchema);

export { ProductAttribute, SkuStock };
