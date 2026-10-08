const express = require("express");
const productControllers = require("../controllers/product-controllers");
const multerUpload = require("../middleware/multer-middleware");
const authenticateMiddleware = require("../middleware/authenticate-middleware");
const authorizeMiddleware = require("../middleware/authorize-middleware");

const router = express.Router();

router.get("/best-sellers", productControllers.getBestSellers);
router.get("/filters", productControllers.getFilterOptions);

router
  .route("/")
  .get(productControllers.getAllProducts)
  .post(
    authenticateMiddleware,
    authorizeMiddleware("admin"),
    multerUpload.single("imageUrl"),
    productControllers.createProduct
  );

router.get("/:id/related", productControllers.getRelatedProducts);

router
  .route("/:id")
  .get(productControllers.getProductById)
  .patch(
    authenticateMiddleware,
    authorizeMiddleware("admin"),
    multerUpload.single("imageUrl"),
    productControllers.updateProduct
  )
  .delete(
    authenticateMiddleware,
    authorizeMiddleware("admin"),
    productControllers.deleteProduct
  );

module.exports = router;
