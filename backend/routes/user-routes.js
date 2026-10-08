const express = require("express");
const userControllers = require("../controllers/user-controllers");
const authenticateMiddleware = require("../middleware/authenticate-middleware");
const authorizeMiddleware = require("../middleware/authorize-middleware");

const router = express.Router();

router.use(authenticateMiddleware);

router.patch("/profile", userControllers.updateProfile);

router
  .route("/favourites")
  .get(authorizeMiddleware("customer"), userControllers.getFavourites);

router
  .route("/favourites/:productId")
  .post(authorizeMiddleware("customer"), userControllers.toggleFavourite);

router
  .route("/cart")
  .get(authorizeMiddleware("customer"), userControllers.getCart)
  .post(authorizeMiddleware("customer"), userControllers.addToCart);

router
  .route("/cart/:productId")
  .patch(authorizeMiddleware("customer"), userControllers.updateCartItem)
  .delete(authorizeMiddleware("customer"), userControllers.removeFromCart);

router.get("/", authorizeMiddleware("admin"), userControllers.getAllUsers);

module.exports = router;
