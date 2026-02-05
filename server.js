import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import todosRouter from "./routes/todos.js";
import ukstksRouter from "./routes/ukstks.js";
import bodyParser from "body-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Increase JSON and URL-encoded payload limits to accept larger base64 uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/todos", todosRouter);
app.use("/api/ukstks", ukstksRouter);

// serve uploaded files from client public folder
const uploadsDir = path.join(__dirname, "../client/public/uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Legacy body-parser usage (kept for compatibility) — already covered by express.json above
app.use(bodyParser.json({ limit: "10mb" }));

// serve uploaded files
app.use("/uploads", express.static(uploadsDir));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });
