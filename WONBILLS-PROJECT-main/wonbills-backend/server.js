const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// routes
const alertRoutes = require("./routes/alert-routes");
const authRoutes = require("./routes/auth-routes");
const clientRoutes = require("./routes/client-routes");
const dashboardRoutes = require("./routes/dashboard-routes");
const invoiceRoutes = require("./routes/invoice-routes");
const itemRoutes = require("./routes/item-routers");
const paymentRoutes = require("./routes/payment-routes");
const sharedRoutes = require("./routes/shared-routes");
const userRoutes = require("./routes/user-routes");
const webhookRoutes = require("./routes/webhook-routes");
const subscriptionRouter = require("./routes/subscription");
const appVersionRoutes = require("./routes/appversion-routes");

const app = express();
const port = process.env.PORT_NO || 8011;


/* ---------------- ALLOWED ORIGINS ---------------- */
const allowedUrls = process.env.FRONTEND_URL?.split(",").map((url) =>
  url.replace(/\/$/, ""),
);

/* ---------------- DATABASE ---------------- */
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_URL);
    console.log("Database connected");
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();

/* ---------------- CORS CONFIG (EXPRESS 5 SAFE) ---------------- */
const corsOptions = {
  origin: (origin, callback) => {
  if (!origin) return callback(null, true);
  const normalizedOrigin = origin.replace(/\/$/, "");
  if (allowedUrls?.includes(normalizedOrigin)) {
    return callback(null, true);
  }
  console.log("❌ CORS blocked:", normalizedOrigin);
  console.log("✅ Allowed list:", allowedUrls);
  return callback(new Error(`CORS blocked: ${normalizedOrigin}`));
},
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/* ---------------- GLOBAL MIDDLEWARE ---------------- */
app.use(cors(corsOptions)); // Handles OPTIONS automatically (NO app.options!)

app.use(cookieParser());

app.use("/api/subscription/webhook", express.raw({ type: "application/json" }));


/* ---------------- WEBHOOK (RAW BODY REQUIRED) ---------------- */
app.use(
  "/api/webhook/wonbills",
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
  webhookRoutes,
);

/* ---------------- NORMAL JSON PARSER ---------------- */
app.use(express.json());
app.use("/api/subscription", subscriptionRouter);
// console.log("Triggering")
/* ---------------- ROUTES ---------------- */
app.use("/api/alert", alertRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/app-version", appVersionRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/shared", sharedRoutes);
app.use("/api/user", userRoutes);

/* ---------------- 404 HANDLER ---------------- */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ---------------- ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  res.status(err.status || 500).json({
    message: err.message || "An unknown error occurred",
  });
});

/* ---------------- START SERVER ---------------- */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
