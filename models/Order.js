const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products:[
        {
            product: {type: Object, required: true},
            quantity: {type: Number, requied: true}
        }
    ],

    user: {
        name: {type: String, required: true},
        userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'}
    },

    orderStatus: {
        type: String,
        required: true,
        default: 'Order Placed'
     }
})

module.exports = mongoose.model('Order', orderSchema);