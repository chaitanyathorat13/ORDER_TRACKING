const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  productId: {
    type: Number,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },
  
  category: {
    type: String,
    required: true
  }
})



module.exports = mongoose.model('Product', productSchema)