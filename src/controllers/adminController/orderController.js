const Order = require('../../models/orderModel');

// List all orders
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.product', 'name price');
    res.status(200).json(orders);
  } catch (error) {
    next({ statusCode: 500, message: 'Failed to fetch orders' });
  }
};

// Update order status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return next({ statusCode: 404, message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated', status: order.status });
  } catch (error) {
    next({ statusCode: 500, message: 'Failed to update order status' });
  }
};


module.exports = {
 getAllOrders,
 updateOrderStatus
};