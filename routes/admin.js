const express = require('express');
const router = express.Router();

const adminController = require('../controller/admin')

router.get('/orders', adminController.ordersPage);
router.get('/all-orders', adminController.getAllOrders)
router.put('/order-status/:orderId', adminController.updateStatus)

module.exports = router;