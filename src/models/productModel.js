const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String }, 
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    isListed: { type: Boolean, default: true },
    preparationTime: { type: String }, // e.g., "30 mins" or "00:30:00"
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
