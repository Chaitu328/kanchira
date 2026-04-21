// models/cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  image: {
    type: String
  },
  variant: {

    color: String,
    size: String,
    material: String,
    price: String,
    storage: String,
    fabric: String,
    discountPercentage: String,
    rating: String
  },
  quantity: {
    type: Number,
    default: 1
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  items: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);


// const mongoose = require('mongoose');

// const cartSchema = new mongoose.Schema({

//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user',
//     required: true,


//   },
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
// }, { timestamps: true });

// module.exports = mongoose.model('Cart', cartSchema);


