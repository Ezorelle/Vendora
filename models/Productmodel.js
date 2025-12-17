const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",  
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],  // Array of image paths
      required: true,
      validate: {
        validator: function(arr) {
          return arr.length >= 1;  // At least one image
        },
        message: "At least one product image is required",
      },
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);