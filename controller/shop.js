const Product = require('../models/Product')
const Order = require('../models/Order')

exports.addToCart = async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  Product.findById(productId)
    .then((product) => {
      return user.addToCart(product)
    })
    .then(() => {
      res.status(200).json({ success: true, message: 'added to cart' });
    })
    .catch((err) => {
      console.log(err.message)
      res.status(500).json(err.message)
    })

}


exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      res.status(201).json({ orders, success: true })
    })
    .catch((err) => {
      res.status(500).json(err.message || 'Internal server error')
    })

};


exports.deleteFromCart = (req, res) => {
  const { productId } = req.params;

  req.user.deleteProductFromCart(productId)
    .then((result) => {
      return req.user.getUpdatedCart();
    })
    .then((cartItems) => {
      res.status(201).json({ updatedCart: cartItems, success: true });
    })
    .catch(err => console.log(err));

}

exports.getCart = async (req, res) => {
  try {
    const cartItems = await req.user.getUpdatedCart();

    res.status(200).json({ cart: cartItems, success: true });
  }
  catch (err) {
    res.status(500).json(err.message || 'Internal server error')
  }
}


exports.mergeGuestCart = async (req, res) => {
  const guestCart = req.body.parsedGuestCart;
  req.user.mergeUserCart(guestCart)
    .then(() => {
      return req.user.getUpdatedCart();
    })
    .then((cartItems) => {
      res.status(201).json({ mergedCart: cartItems, success: true })
    })
    .catch((err) => {
      res.status(500).json(err.message || 'Internal server error')
    })
}


exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (products) {
      return res.status(200).json({ products: products, success: true })
    }

    throw new Error('products not found')
  }
  catch (err) {
    res.status(500).json(err.message || 'Internal server error')
  }

}


exports.createOrder = (req, res) => {
  req.user.populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { product: { ...i.productId._doc }, quantity: i.quantity }
      })

      const order = new Order({
        products: products,
        user: {
          name: req.user.username,
          userId: req.user._id
        }
      })
      return order.save();
    })
    .then(() => req.user.clearCart())
    .then(() => {
      res.status(200).json({ success: true, message: 'order created' })
    })
    .catch(err => console.log(err))
}


exports.getOrderStatus = async function (req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne(
      { _id: orderId, 'user.userId': req.user._id }, // Query with orderId and userId
      'orderStatus' // Projection to select only the orderStatus field
    );

    if (order) {
      return res.status(201).json({ currentStatus: order.orderStatus, success: true })
    }

    throw new Error('conflict in orders')
  }
  catch (err) {
    console.log(err);
    res.status(500).json(err.message || 'Internal Server Error')
  }
}