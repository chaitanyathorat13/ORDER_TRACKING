const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        allowNull: false,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, ref:'Product', required: true },
            quantity: { type: Number, required: true }
        }]
    }
})



userSchema.methods.addToCart = function (product) {

    const productIndex = this.cart.items.findIndex((cp) => {
        return cp.productId.toString() === product._id.toString();
    })

    let userCartItems = this.cart.items;
    let newQuantity = 1;
    console.log(productIndex)
    if (productIndex >= 0) {
        newQuantity = this.cart.items[productIndex].quantity + 1;
        userCartItems[productIndex].quantity = newQuantity;
    }
    else {
        userCartItems.push({ productId: product._id, quantity: 1 });
    }

    const updatedCart = { items: userCartItems };
    this.cart = updatedCart;
    return this.save()
}



userSchema.methods.mergeUserCart = function (guestCart){
    const userCart = this.cart.items;
    guestCart.forEach((guestProd) => {
        let index = userCart.findIndex(p=> guestProd._id.toString() == p.productId.toString());
        if(index>=0){
            const newQuantity = this.cart.items[index].quantity + 1;
            userCart[index].quantity = newQuantity;
        }
        else{
            userCart.push({productId: guestProd._id, quantity: 1 });
        }
    });

    const updatedCart = { items: userCart };
    this.cart = updatedCart;

    return this.save();
}



userSchema.methods.deleteProductFromCart = function (productId){
    const updatedCart = this.cart.items.filter(p=>{
        return  p.productId.toString() !== productId.toString();
    });

    this.cart.items = updatedCart;
    return this.save()
}


userSchema.methods.getUpdatedCart = async function (){
    const user = await this.populate('cart.items.productId');
    const cart = user.cart.items;

    const cartItems = [];
    cart.forEach(item => {
      cartItems.push({
        _id: item.productId._id, productId: item.productId.productId,
        name: item.productId.name, category: item.productId.category, quantity: item.quantity
      })
    });

    return cartItems
}


userSchema.methods.clearCart = function(){
    this.cart.items = [];
    return this.save();
}

module.exports = mongoose.model('User', userSchema);