import express from "express"
import Asset from "../models/Asset.js"

const router = express.Router()

// Get all assets
router.get("/", async (req, res) => {
  try {
    const { type, pageId } = req.query
    const query = {}

    if (type) query.type = type
    if (pageId) query.pageId = pageId

    const assets = await Asset.find(query).sort({ createdAt: -1 })
    res.json(assets)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single asset
router.get("/:id", async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" })
    }
    res.json(asset)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create asset
router.post("/", async (req, res) => {
  try {
    const { type, url, title, description, pageId } = req.body

    const asset = new Asset({
      type,
      url,
      title,
      description: description || "",
      pageId,
    })

    await asset.save()
    res.status(201).json(asset)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update asset
router.put("/:id", async (req, res) => {
  try {
    const { type, url, title, description, pageId } = req.body

    const asset = await Asset.findByIdAndUpdate(req.params.id, { type, url, title, description, pageId }, { new: true })

    if (!asset) {
      return res.status(404).json({ error: "Asset not found" })
    }

    res.json(asset)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete asset
router.delete("/:id", async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id)

    if (!asset) {
      return res.status(404).json({ error: "Asset not found" })
    }

    res.json({ message: "Asset deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
