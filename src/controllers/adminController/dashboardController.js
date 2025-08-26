const Order = require('../../models/orderModel');
const User = require('../../models/userModel');
const Product = require('../../models/productModel');

const getDashboardData = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // Recent Orders (limit 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("user", "name email")
      .populate("items.product", "name price");

    // Monthly Orders & Revenue (last 6 months)
    const monthlyData = await Order.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, "$totalAmount", 0],
            },
          },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Order Status Distribution
    const orderStatusData = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      stats: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue[0]?.total || 0,
      },
      monthlyData: monthlyData.map((m) => ({
        month: new Date(2025, m._id.month - 1).toLocaleString("default", { month: "short" }),
        orders: m.orders,
        revenue: m.revenue,
      })),
      orderStatusData: orderStatusData.map((s) => ({
        status: s._id,
        count: s.count,
      })),
      recentOrders: recentOrders.map((order) => ({
        id: order._id,
        customer: order.user?.name || "Unknown",
        items: order.items.map((i) => i.product?.name).join(", "),
        time: order.createdAt,
        total: order.totalAmount,
        status: order.status,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

module.exports = { getDashboardData };
