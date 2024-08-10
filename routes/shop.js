const express = require('express');
const router = express.Router();

const userController = require('../controller/user')
const shopController = require('../controller/shop')

const userAuthentication = require('../middleware/auth')

router.get('/products', shopController.getProducts);
router.use(userAuthentication.authenticate);
router.get('/check-user', userController.checkAuthenticity);
router.post('/cart', shopController.addToCart)
router.delete('/cart/:productId', shopController.deleteFromCart)
router.get('/cart', shopController.getCart);
router.post('/guest-cart', shopController.mergeGuestCart);
router.post('/create-order', shopController.createOrder);
router.get('/orders', shopController.getOrders)
router.get('/order-status/:orderId', shopController.getOrderStatus)
module.exports = router;