const Product = require("../Model/product-model");
const Inventory = require("../Model/inventory-model");
const Order = require("../Model/order-model");

const dashboardController = {};

dashboardController.getdashbaordstats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();

        const inventoryData = await Inventory.find();
        let lowStockCount = 0;

        inventoryData.forEach(item => {
            if (item.quantity > 0 && item.quantity < 10) {
                lowStockCount++;
            }
        });

        const inStockCount = await Inventory.countDocuments({ quantity: { $gt: 0 } });


        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("items.productId");

        const recentOperations = [];
        recentOrders.forEach(order => {
            order.items.forEach(item => {
                recentOperations.push({
                    _id: `${order._id}-${item._id}`,
                    operation: "Sale",
                    product: item.productId?.name || "Unknown Product",
                    quantity: item.quantity,
                    status: order.status,
                    time: order.createdAt
                });
            });
        });

        res.json({
            totalProducts,
            inStock: inStockCount,
            lowStock: lowStockCount,
            recentOperations: recentOperations.slice(0, 5)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = dashboardController;