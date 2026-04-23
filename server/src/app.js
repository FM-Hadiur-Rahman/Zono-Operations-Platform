import express from "express";
import cors from "cors";
import morgan from "morgan";
import healthRoutes from "./routes/healthRoutes.js";
import setupRoutes from "./routes/setupRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import catalogSetupRoutes from "./routes/catalogSetupRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notFoundMiddleware from "./middlewares/notFoundMiddleware.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Kaffee Krümel API running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/catalog", catalogSetupRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
