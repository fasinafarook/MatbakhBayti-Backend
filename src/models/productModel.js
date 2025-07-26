const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String }, 
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    isListed: { type: Boolean, default: true },
    preparationTime: { type: String }, 
     type: {
      type: String,
      enum: ['Veg', 'Non-Veg'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
