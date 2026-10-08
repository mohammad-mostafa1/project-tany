const Product = require("../models/product-model");
const deleteUploadedFile = require("../utils/delete-uploaded-file");

const buildFilter = (query) => {
  const filter = {};

  if (query.category) filter.category = query.category.toLowerCase();
  if (query.subCategory) filter.subCategory = query.subCategory.toLowerCase();

  if (query.brand) {
    const brands = String(query.brand)
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);
    if (brands.length) filter.brand = { $in: brands };
  }

  const minPrice = Number(query.minPrice);
  const maxPrice = Number(query.maxPrice);
  if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
    filter.price = {};
    if (!Number.isNaN(minPrice)) filter.price.$gte = minPrice;
    if (!Number.isNaN(maxPrice)) filter.price.$lte = maxPrice;
  }

  if (query.search) {
    const safe = String(query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: safe, $options: "i" } },
      { brand: { $regex: safe, $options: "i" } },
    ];
  }

  return filter;
};

const SORTS = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  rating: { rating: -1 },
  "best-selling": { sold: -1 },
};

const getAllProducts = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const sort = SORTS[req.query.sort] || SORTS.newest;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      status: "success",
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: { products },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in getAllProducts: ${error.message}`,
    });
  }
};

const getBestSellers = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 24);
    const products = await Product.find().sort({ sold: -1 }).limit(limit);

    res.status(200).json({
      status: "success",
      count: products.length,
      data: { products },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in getBestSellers: ${error.message}`,
    });
  }
};

// Powers the sidebar filters: which brands exist in this category and the price bounds.
const getFilterOptions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category.toLowerCase();
    if (req.query.subCategory) filter.subCategory = req.query.subCategory.toLowerCase();

    const [brands, bounds] = await Promise.all([
      Product.distinct("brand", filter),
      Product.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
      ]),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        brands: brands.sort((a, b) => a.localeCompare(b)),
        minPrice: bounds[0] ? Math.floor(bounds[0].minPrice) : 0,
        maxPrice: bounds[0] ? Math.ceil(bounds[0].maxPrice) : 0,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in getFilterOptions: ${error.message}`,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    res.status(200).json({ status: "success", data: { product } });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in getProductById: ${error.message}`,
    });
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    const products = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
    })
      .sort({ sold: -1 })
      .limit(4);

    res.status(200).json({
      status: "success",
      count: products.length,
      data: { products },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in getRelatedProducts: ${error.message}`,
    });
  }
};

const parseSpecs = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const createProduct = async (req, res) => {
  try {
    const body = { ...req.body };

    if (req.file) body.imageUrl = req.file.filename;
    if (body.specs) body.specs = parseSpecs(body.specs);
    if (body.subCategory === "" || body.subCategory === "null") body.subCategory = null;
    if (body.oldPrice === "" || body.oldPrice === "null") body.oldPrice = null;

    const product = await Product.create(body);

    res.status(201).json({ status: "success", data: { product } });
  } catch (error) {
    if (req.file) deleteUploadedFile("products", req.file.filename);
    res.status(400).json({
      status: "error",
      message: `Error in createProduct: ${error.message}`,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      if (req.file) deleteUploadedFile("products", req.file.filename);
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    const body = { ...req.body };
    const oldImage = product.imageUrl;

    if (req.file) body.imageUrl = req.file.filename;
    if (body.specs) body.specs = parseSpecs(body.specs);
    if (body.subCategory === "" || body.subCategory === "null") body.subCategory = null;
    if (body.oldPrice === "" || body.oldPrice === "null") body.oldPrice = null;

    Object.assign(product, body);
    await product.save();

    if (req.file && oldImage && oldImage !== "default-product.svg") {
      deleteUploadedFile("products", oldImage);
    }

    res.status(200).json({ status: "success", data: { product } });
  } catch (error) {
    if (req.file) deleteUploadedFile("products", req.file.filename);
    res.status(400).json({
      status: "error",
      message: `Error in updateProduct: ${error.message}`,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    if (product.imageUrl && product.imageUrl !== "default-product.svg") {
      deleteUploadedFile("products", product.imageUrl);
    }

    res.status(200).json({ status: "success", data: null });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: `Error in deleteProduct: ${error.message}`,
    });
  }
};

module.exports = {
  getAllProducts,
  getBestSellers,
  getFilterOptions,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
