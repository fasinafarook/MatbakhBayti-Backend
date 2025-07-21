const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isListed: {
      type: Boolean,
      default: true, // ✅ Default: listed/active
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
