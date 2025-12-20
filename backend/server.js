import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"

// Routes
import pageRoutes from "./routes/pages.js"
import blockRoutes from "./routes/blocks.js"
import tagRoutes from "./routes/tags.js"
import searchRoutes from "./routes/search.js"
import assetRoutes from "./routes/assets.js"

/* ----------------------------------------
   ENV SETUP (MUST BE FIRST)
----------------------------------------- */
dotenv.config()

/* ----------------------------------------
   ENV VALIDATION (FAIL FAST)
----------------------------------------- */
const requiredEnv = ["MONGODB_URI"]
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`)
    process.exit(1)
  }
})

const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || "development"
const CORS_ORIGIN = process.env.CORS_ORIGIN || "https://knowledge-map.netlify.app" || "*"

/* ----------------------------------------
   APP INIT
----------------------------------------- */
const app = express()

/* ----------------------------------------
   MIDDLEWARE
----------------------------------------- */
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
)

app.use(express.json({ limit: "10mb" }))

/* ----------------------------------------
   DATABASE
----------------------------------------- */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed", err)
    process.exit(1)
  })

/* ----------------------------------------
   ROUTES
----------------------------------------- */
app.use("/api/pages", pageRoutes)
app.use("/api/blocks", blockRoutes)
app.use("/api/tags", tagRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/assets", assetRoutes)

/* ----------------------------------------
   HEALTH CHECK
----------------------------------------- */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    env: NODE_ENV,
    uptime: process.uptime(),
  })
})

/* ----------------------------------------
   GLOBAL ERROR HANDLER
----------------------------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err)

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  })
})

/* ----------------------------------------
   SERVER START
----------------------------------------- */
if (NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${NODE_ENV}]`)
  })
}

export default app
