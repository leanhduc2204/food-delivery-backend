import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./config/swagger";

const app: Application = express();

// Routes
import authRoutes from "./modules/auth/routes";
import restaurantRoutes from "./modules/restaurants/routes";
import orderRoutes from "./modules/orders/routes";
import categoryRoutes from "./modules/categories/routes";
import globalCategoryRoutes from "./modules/global-categories/routes";
import addressRoutes from "./modules/addresses/routes";
import paymentRoutes from "./modules/payments/routes";

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/global-categories", globalCategoryRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/payments", paymentRoutes);

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API docs (Swagger UI)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
