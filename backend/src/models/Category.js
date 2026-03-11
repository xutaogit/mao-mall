import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  icon: String,
  sort: {
    type: Number,
    default: 0
  },
  showStatus: {
    type: Number,
    default: 1,
    enum: [0, 1]
  }
}, {
  timestamps: true
});

// 索引
categorySchema.index({ sort: 1 });
categorySchema.index({ showStatus: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
