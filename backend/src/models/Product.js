import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  productSn: {
    type: String,
    required: true,
    unique: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  promotionPrice: {
    type: Number,
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
  sale: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: '件'
  },
  pic: String,
  albumPics: [String],
  subTitle: String,
  description: String,
  detailHtml: String,
  sort: {
    type: Number,
    default: 0
  },
  deleteStatus: {
    type: Number,
    default: 0,
    enum: [0, 1]
  },
  publishStatus: {
    type: Number,
    default: 0,
    enum: [0, 1]
  },
  newStatus: {
    type: Number,
    default: 0,
    enum: [0, 1]
  },
  recommendStatus: {
    type: Number,
    default: 0,
    enum: [0, 1]
  }
}, {
  timestamps: true
});

// 索引
productSchema.index({ categoryId: 1 });
productSchema.index({ publishStatus: 1 });
productSchema.index({ deleteStatus: 1 });
productSchema.index({ name: 'text', productSn: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
