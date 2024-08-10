const mongoose = require('mongoose')
const Order = require('../models/Order')

exports.ordersPage = (req, res)=>{
    res.sendFile('admin.html', {root: './views/admin'})
}

exports.getAllOrders = async (req,res)=>{
    try{
        const orders = await Order.find();
        res.status(201).json({orders, success: true})

    }
    catch(error){
        console.log(error);
        res.status(500).json(error.message || 'Internal Server Error')
    }
}

exports.updateStatus = async (req, res)=> {
    const {orderId} = req.params;
    const {orderStatus} = req.body;
  
    try {
        const result = await Order.updateOne(
          { _id: orderId},  // Filter by orderId
          { $set: { orderStatus: orderStatus } }       // Update the orderStatus field
        );

    
        if (result.modifiedCount > 0) {
            
            res.status(200).json({updation: 'successful'})
        } else {
            res.status(409).json({ error: 'No order associated with the id' })
        }
      } catch (error) {
        console.error('Error updating order status:', error);
      }
}