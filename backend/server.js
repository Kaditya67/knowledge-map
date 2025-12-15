import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"

// Import routes
import pageRoutes from "./routes/pages.js"
import blockRoutes from "./routes/blocks.js"
import tagRoutes from "./routes/tags.js"
import searchRoutes from "./routes/search.js"
import assetRoutes from "./routes/assets.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ojhaaditya913:riijl0qvQKEHOuNq@cluster0.kym3i.mongodb.net/knowledge-hub"

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/pages", pageRoutes)
app.use("/api/blocks", blockRoutes)
app.use("/api/tags", tagRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/assets", assetRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Knowledge Hub API is running" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
