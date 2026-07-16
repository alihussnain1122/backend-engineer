import express from "express";
import apiRouter from "./routes/api.js";
import adminRouter from "./routes/admin.js";

const app = express();

app.set("trust proxy", 1);
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", apiRouter);
app.use("/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
  });
});

export default app;