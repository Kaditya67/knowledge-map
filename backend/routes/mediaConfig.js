import express from "express"
import MediaConfig from "../models/MediaConfig.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Get config (or create default if none exists) - Public read access
router.get("/", async (req, res) => {
  try {
    // Return a global config or first available config for public access
    let config = await MediaConfig.findOne()

    if (!config) {
        // Default seed - create a global config without user association
        config = await MediaConfig.create({
            customTypes: [
                { name: "Anime", unit: "Ep", totalLabel: "Total Episodes" },
                { name: "Manhwa", unit: "Ch", totalLabel: "Total Chapters" },
                { name: "Manga", unit: "Ch", totalLabel: "Total Chapters" },
                { name: "Video", unit: "Vid", totalLabel: "Total Videos" },
            ],
            customStatuses: [
                { value: "planning", label: "Planning", color: "#64748b" },
                { value: "in_progress", label: "In Progress", color: "#3b82f6" },
                { value: "completed", label: "Completed", color: "#10b981" },
                { value: "dropped", label: "Dropped", color: "#ef4444" },
                { value: "paused", label: "Paused", color: "#f59e0b" },
            ]
        })
    }
    
    res.json(config)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update config - Requires authentication
router.put("/", protect, async (req, res) => {
  try {
    const { customTypes, customStatuses } = req.body
    
    // Find and update the global config or create if it doesn't exist
    const config = await MediaConfig.findOneAndUpdate(
        {}, // Empty query to find any/first config
        { customTypes, customStatuses },
        { new: true, upsert: true }
    )
    
    res.json(config)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
