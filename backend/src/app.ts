// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes";
import spjRoutes from "./routes/spjRoutes";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/spj", spjRoutes);
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Welcome to SUPERJ-E API!" });
});

export default app;
