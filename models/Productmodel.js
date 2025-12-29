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
  min: 0,
},
    stock: {
  type: Number,
  required: true,
  min: 0,
},
    category: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],  
      required: true,
      validate: {
        validator: function(arr) {
          return arr.length >= 1;  
        message: "At least one product image is required",
      },
    },
  description: {
  type: String,
  required: true,
  trim: true,
  maxlength: 1000,
}


  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);