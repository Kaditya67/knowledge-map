import express from "express"
import Tag from "../models/Tag.js"
import Page from "../models/Page.js"

const router = express.Router()

// Get all tags
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 })
    res.json(tags)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single tag
router.get("/:id", async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id)
    if (!tag) {
      return res.status(404).json({ error: "Tag not found" })
    }
    res.json(tag)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create tag
router.post("/", async (req, res) => {
  try {
    const { name, color } = req.body

    const existingTag = await Tag.findOne({ name: name.toLowerCase() })
    if (existingTag) {
      return res.status(400).json({ error: "Tag already exists" })
    }

    const tag = new Tag({
      name: name.toLowerCase(),
      color: color || "#3b82f6",
    })

    await tag.save()
    res.status(201).json(tag)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update tag
router.put("/:id", async (req, res) => {
  try {
    const { name, color } = req.body

    const tag = await Tag.findByIdAndUpdate(req.params.id, { name: name.toLowerCase(), color }, { new: true })

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" })
    }

    res.json(tag)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete tag
router.delete("/:id", async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id)

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" })
    }

    await Page.updateMany({ tags: req.params.id }, { $pull: { tags: req.params.id } })
    res.json({ message: "Tag deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get pages by tag
router.get("/:id/pages", async (req, res) => {
  try {
    const pages = await Page.find({ tags: req.params.id }).populate("tags").sort({ updatedAt: -1 })
    res.json(pages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
