const mongoose = require("mongoose");

const specSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Product name must be at least 3 characters long"],
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
      enum: {
        values: ["mobiles", "laptops", "accessories"],
        message: "Category must be mobiles, laptops, or accessories",
      },
    },

    subCategory: {
      type: String,
      lowercase: true,
      default: null,
      enum: {
        values: ["headphones", "keyboards", "mice", null],
        message: "Sub category must be headphones, keyboards, or mice",
      },
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    specs: {
      type: [specSchema],
      default: [],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    oldPrice: {
      type: Number,
      default: null,
      min: [0, "Old price cannot be negative"],
    },

    imageUrl: {
      type: String,
      trim: true,
      default: "default-product.svg",
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be greater than 5"],
    },

    sold: {
      type: Number,
      default: 0,
      min: [0, "Sold count cannot be negative"],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("discountPercentage").get(function () {
  if (!this.oldPrice || this.oldPrice <= this.price) return 0;
  return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
});

productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

productSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
});

productSchema.index({ category: 1, brand: 1, price: 1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
