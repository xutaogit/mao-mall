import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  price: Number,
  productPic: String,
  productName: String
}, {
  timestamps: true
});

// 索引
cartItemSchema.index({ memberId: 1 });
cartItemSchema.index({ productId: 1 });

const CartItem = mongoose.model('CartItem', cartItemSchema);

export default CartItem;
