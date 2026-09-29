const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null // null means 1st level Main Category; non-null means 2nd level Subcategory
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
