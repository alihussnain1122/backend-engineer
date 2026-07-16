import express from "express";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import apiRouter from "./routes/api.js";
import redisClient from "./config/redis.js";
import { createAdminRouter } from "./routes/admin.js";

const app = express();
const adminRouter = createAdminRouter(redisClient);
const appDir = dirname(fileURLToPath(import.meta.url));
const dashboardDir = resolve(appDir, "../dashboard");

app.set("trust proxy", 1);
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use("/dashboard", express.static(dashboardDir));

app.get("/", (req, res) => {
  return res.redirect("/dashboard/");
});

app.get("/dashboard", (req, res) => {
  return res.redirect("/dashboard/");
});

app.get("/dashboard/", (req, res) => {
  return res.sendFile(resolve(dashboardDir, "index.html"));
});

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