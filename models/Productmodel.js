const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // seller not required for now
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true, // you said image is required
    },
    description: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true // creates createdAt + updatedAt automatically
  }
);

module.exports = mongoose.model('Product', productSchema);
