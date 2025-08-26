const Order = require('../../models/orderModel');

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email')
      .populate('items.product');
      
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

 const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
 getAllOrders,
 updateOrderStatus
};
