const User = require("../models/user-model");
const Product = require("../models/product-model");

const getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("favourites");

    res.status(200).json({
      status: "success",
      count: user.favourites.length,
      data: { products: user.favourites },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in getFavourites: ${error.message}`,
    });
  }
};

// Toggling keeps the heart button to a single call instead of add/remove round trips.
const toggleFavourite = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    const user = await User.findById(req.userId);
    const index = user.favourites.findIndex((id) => id.equals(productId));

    if (index === -1) {
      user.favourites.push(productId);
    } else {
      user.favourites.splice(index, 1);
    }

    await user.save();
    await user.populate("favourites");

    res.status(200).json({
      status: "success",
      isFavourite: index === -1,
      data: { products: user.favourites },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in toggleFavourite: ${error.message}`,
    });
  }
};

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("cart.product");

    // A product deleted by an admin should silently drop out of old carts.
    const items = user.cart.filter((item) => item.product);

    res.status(200).json({
      status: "success",
      count: items.length,
      data: { items },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in getCart: ${error.message}`,
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const requested = Number(quantity) || 1;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        status: "fail",
        message: "This product is out of stock",
      });
    }

    const user = await User.findById(req.userId);
    const existing = user.cart.find((item) => item.product.equals(productId));

    if (existing) {
      existing.quantity = Math.min(existing.quantity + requested, product.stock);
    } else {
      user.cart.push({
        product: productId,
        quantity: Math.min(requested, product.stock),
      });
    }

    await user.save();
    await user.populate("cart.product");

    res.status(200).json({
      status: "success",
      count: user.cart.length,
      data: { items: user.cart },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in addToCart: ${error.message}`,
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: "fail",
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        status: "fail",
        message: `Only ${product.stock} left in stock`,
      });
    }

    const user = await User.findById(req.userId);
    const item = user.cart.find((cartItem) => cartItem.product.equals(productId));

    if (!item) {
      return res.status(404).json({
        status: "fail",
        message: "Product is not in your cart",
      });
    }

    item.quantity = quantity;
    await user.save();
    await user.populate("cart.product");

    res.status(200).json({
      status: "success",
      count: user.cart.length,
      data: { items: user.cart },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in updateCartItem: ${error.message}`,
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.userId);
    user.cart = user.cart.filter((item) => !item.product.equals(productId));

    await user.save();
    await user.populate("cart.product");

    res.status(200).json({
      status: "success",
      count: user.cart.length,
      data: { items: user.cart },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in removeFromCart: ${error.message}`,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, phone, address },
      { new: true, runValidators: true }
    );

    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in updateProfile: ${error.message}`,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      count: users.length,
      data: { users },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in getAllUsers: ${error.message}`,
    });
  }
};

module.exports = {
  getFavourites,
  toggleFavourite,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  updateProfile,
  getAllUsers,
};
