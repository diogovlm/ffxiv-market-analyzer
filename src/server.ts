import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import marketRoutes from "./routes/marketRoutes";
import craftingRoutes from "./routes/craftingRoutes";
import profitRoutes from "./routes/profitRoutes";
import alertRoutes from "./routes/alertRoutes";
import { scheduleAlertJob } from "./jobs/scheduleAlerts";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/crafting", craftingRoutes);
app.use("/api/profit", profitRoutes);
app.use("/api/alerts", alertRoutes);
scheduleAlertJob();

const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
