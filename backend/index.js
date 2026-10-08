// Atlas SRV lookups fail on some local ISP resolvers, so pin public DNS first.
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const path = require("path");
const cors = require("cors");

require("dotenv").config();

const dbConnect = require("./config/db-connect");
const authRouter = require("./routes/auth-routes");
const productRouter = require("./routes/product-routes");
const userRouter = require("./routes/user-routes");
const orderRouter = require("./routes/order-routes");

dbConnect();

const app = express();

// The Angular dev server picks a free port (4200, 54453, ...), so any local origin is
// allowed. This API is only ever served on localhost.
app.use(
  cors({
    origin: (origin, callback) => {
      const isLocal =
        !origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      callback(isLocal ? null : new Error("Origin not allowed by CORS"), isLocal);
    },
  })
);
app.use(express.json());

app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);

app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((error, req, res, next) => {
  const status = error.status || 400;
  res.status(status).json({
    status: "error",
    message: error.message || "Something went wrong",
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
