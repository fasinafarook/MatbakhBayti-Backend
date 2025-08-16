// const Order = require("../../models/orderModel");
// const Cart = require("../../models/cartModel");
// const CustomError = require("../../services/customError");
// // const Razorpay = require("razorpay");

// // const razorpay = new Razorpay({
// //   key_id: process.env.RAZORPAY_KEY_ID,
// //   key_secret: process.env.RAZORPAY_SECRET,
// // });

// const placeOrder = async (req, res, next) => {
//   try {
//     const { paymentMethod, shippingAddress } = req.body;
//     const userId = req.user.id;

//     // 🔍 Validate address fields
//     const requiredFields = [
//       "fullName", "phone", "street",
//       "city", "state", "postalCode", "country"
//     ];

//     for (const field of requiredFields) {
//       if (!shippingAddress?.[field]) {
//         throw new CustomError(400, `Missing field: ${field}`);
//       }
//     }

//     // 🔍 Validate coordinates if location provided
//     if (shippingAddress.location) {
//       const { coordinates } = shippingAddress.location;
//       if (!Array.isArray(coordinates) || coordinates.length !== 2) {
//         throw new CustomError(400, "Invalid GPS coordinates. Must be [longitude, latitude]");
//       }
//     }

//     // 🛒 Get user's cart
//     const cart = await Cart.findOne({ user: userId }).populate("items.product");
//     if (!cart || cart.items.length === 0) {
//       throw new CustomError(400, "Your cart is empty");
//     }

//     const totalAmount = cart.items.reduce(
//       (sum, item) => sum + item.quantity * item.product.price,
//       0
//     );

//     const orderItems = cart.items.map((item) => ({
//       product: item.product._id,
//       quantity: item.quantity,
//     }));

//     if (paymentMethod === "COD") {
//       const order = await Order.create({
//         user: userId,
//         items: orderItems,
//         totalAmount,
//         paymentMethod,
//         shippingAddress,
//         status: "confirmed",
//       });

//       cart.items = [];
//       await cart.save();

//       return res.status(201).json({
//         success: true,
//         message: "Order placed with Cash on Delivery",
//         data: order,
//       });
//     }

//     if (paymentMethod === "Online") {
//       // Example: Create Razorpay order here
//       // const razorpayOrder = await razorpay.orders.create({
//       //   amount: totalAmount * 100, // amount in paise
//       //   currency: "INR",
//       //   receipt: `rcpt_${Date.now()}`,
//       // });

//       return res.status(200).json({
//         success: true,
//         message: "Proceed to Razorpay Payment",
//         data: {
//           // razorpayOrderId: razorpayOrder.id,
//           // amount: razorpayOrder.amount,
//           // currency: razorpayOrder.currency,
//           shippingAddress,
//           orderItems,
//           totalAmount,
//         },
//       });
//     }

//     throw new CustomError(400, "Invalid payment method");
//   } catch (err) {
//     next(err);
//   }
// };

// const confirmOnlinePayment = async (req, res, next) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       shippingAddress,
//       orderItems,
//       totalAmount,
//     } = req.body;

//     const order = await Order.create({
//       user: req.user.id,
//       items: orderItems,
//       totalAmount,
//       paymentMethod: "Online",
//       shippingAddress,
//       status: "confirmed",
//     });

//     await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

//     res.status(201).json({
//       success: true,
//       message: "Online payment confirmed and order placed",
//       data: order,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// const getSavedAddresses = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user.id })
//       .select("shippingAddress")
//       .sort({ createdAt: -1 });

//     const uniqueAddresses = [];
//     const seenKeys = new Set();

//     for (const { shippingAddress } of orders) {
//       const key = `${shippingAddress.street}-${shippingAddress.city}-${shippingAddress.postalCode}`;
//       if (!seenKeys.has(key)) {
//         seenKeys.add(key);
//         uniqueAddresses.push(shippingAddress);
//       }
//     }

//     res.json(uniqueAddresses);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch addresses" });
//   }
// };

// module.exports = {
//   placeOrder,
//   confirmOnlinePayment,
//   getSavedAddresses,
// };
const Order = require("../../models/orderModel");
const Cart = require("../../models/cartModel");
const CustomError = require("../../services/customError");

const placeOrder = async (req, res, next) => {
  try {
    const { paymentMethod, shippingAddress } = req.body;
    const userId = req.user.id;

    // Validate shipping address
    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.street ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.postalCode ||
      !shippingAddress?.country
    ) {
      throw new CustomError(400, "Incomplete shipping address");
    }

    // Validate coordinates if present
    if (shippingAddress.location && shippingAddress.location.coordinates) {
      const coords = shippingAddress.location.coordinates;
      if (!Array.isArray(coords)) {
        throw new CustomError(400, "Coordinates must be an array");
      }
      if (coords.length !== 2) {
        throw new CustomError(400, "Coordinates must contain exactly 2 numbers [longitude, latitude]");
      }
      if (typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
        throw new CustomError(400, "Coordinates must be numbers");
      }
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      throw new CustomError(400, "Cart is empty");
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    );

    // Prepare order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }));

    // Create the order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      paymentMethod,
      shippingAddress,
      status: "pending",

    //   status: paymentMethod === "COD" ? "confirmed" : "pending",
    });

    // Clear the cart
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    res.status(201).json({
      success: true,
      message: `Order placed successfully with ${paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}`,
      data: order,
    });

  } catch (err) {
    next(err);
  }
};

const getSavedAddresses = async (req, res, next) => {
  try {
    // Find all orders for the user and get unique shipping addresses
    const orders = await Order.find({ user: req.user.id })
      .select('shippingAddress')
      .sort({ createdAt: -1 });

    // Create a map to track unique addresses
    const uniqueAddresses = [];
    const addressMap = new Map();

    orders.forEach(order => {
      // Create a unique key for each address
      const addressKey = `${order.shippingAddress.street}-${order.shippingAddress.city}-${order.shippingAddress.postalCode}`;
      
      if (!addressMap.has(addressKey)) {
        addressMap.set(addressKey, true);
        uniqueAddresses.push({
          ...order.shippingAddress.toObject(),
          // Add a generated ID if needed for frontend
          _id: order._id // Using order ID as a reference
        });
      }
    });

    res.status(200).json({
      success: true,
      data: uniqueAddresses
    });
  } catch (err) {
    next(err);
  }
};
const updateAddress = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const updatedAddress = req.body;

    // Update the shippingAddress object directly
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        user: req.user.id,
      },
      {
        $set: {
          shippingAddress: updatedAddress,
        },
      },
      { new: true }
    );

    if (!order) {
      throw new CustomError(404, "Order not found or unauthorized");
    }

    res.status(200).json({
      success: true,
      message: "Shipping address updated successfully",
      data: order.shippingAddress,
    });
  } catch (err) {
    next(err);
  }
};


const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id
    });

    if (!order) {
      throw new CustomError(404, 'Order not found');
    }

    // Check if order can be cancelled (only pending or confirmed orders)
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new CustomError(400, 'Order cannot be cancelled at this stage');
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (err) {
    next(err);
  }
};
const getOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    }).populate("items.product");

    if (!order) {
      throw new CustomError(404, "Order not found");
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};
const cancelOrderItem = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      throw new CustomError(404, "Order not found");
    }

    const item = order.items.id(itemId);
    if (!item) {
      throw new CustomError(404, "Order item not found");
    }

    if (!["pending", "confirmed"].includes(item.status)) {
      throw new CustomError(400, "Item cannot be cancelled at this stage");
    }

    item.status = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Item cancelled successfully",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  placeOrder, 
  getSavedAddresses, 
  updateAddress,
  getMyOrders,
  cancelOrder,
  getOrderDetails,
  cancelOrderItem
};
// module.exports = { placeOrder, getSavedAddresses,updateAddress };