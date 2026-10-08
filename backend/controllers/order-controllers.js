const Order = require("../models/order-model");
const User = require("../models/user-model");
const Product = require("../models/product-model");

const createOrder = async (req, res) => {
  try {
    const { shippingAddress, phone, paymentMethod } = req.body;

    const user = await User.findById(req.userId).populate("cart.product");
    const cartItems = user.cart.filter((item) => item.product);

    if (cartItems.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Your cart is empty",
      });
    }

    const outOfStock = cartItems.find((item) => item.product.stock < item.quantity);
    if (outOfStock) {
      return res.status(400).json({
        status: "fail",
        message: `Not enough stock for ${outOfStock.product.name}`,
      });
    }

    const items = cartItems.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      imageUrl: item.product.imageUrl,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.userId,
      items,
      totalPrice,
      shippingAddress: shippingAddress || user.address,
      phone: phone || user.phone,
      paymentMethod,
    });

    await Promise.all(
      items.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, sold: item.quantity },
        })
      )
    );

    user.cart = [];
    await user.save();

    res.status(201).json({ status: "success", data: { order } });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in createOrder: ${error.message}`,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      count: orders.length,
      data: { orders },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in getMyOrders: ${error.message}`,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      count: orders.length,
      data: { orders },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in getAllOrders: ${error.message}`,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate("user", "firstName lastName email");

    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });
    }

    res.status(200).json({ status: "success", data: { order } });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in updateOrderStatus: ${error.message}`,
    });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
