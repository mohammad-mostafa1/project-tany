const express = require("express");
const orderControllers = require("../controllers/order-controllers");
const authenticateMiddleware = require("../middleware/authenticate-middleware");
const authorizeMiddleware = require("../middleware/authorize-middleware");

const router = express.Router();

router.use(authenticateMiddleware);

router
  .route("/")
  .get(authorizeMiddleware("customer"), orderControllers.getMyOrders)
  .post(authorizeMiddleware("customer"), orderControllers.createOrder);

router.get("/all", authorizeMiddleware("admin"), orderControllers.getAllOrders);

router.patch(
  "/:id/status",
  authorizeMiddleware("admin"),
  orderControllers.updateOrderStatus
);

module.exports = router;
