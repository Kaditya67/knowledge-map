import express from "express"
import Page from "../models/Page.js"
import Tag from "../models/Tag.js"

const router = express.Router()

// Global search
router.get("/", async (req, res) => {
  try {
    const { q } = req.query

    if (!q || q.trim() === "") {
      return res.json({ pages: [], tags: [] })
    }

    const searchRegex = new RegExp(q, "i")

    const pages = await Page.find({
      $or: [{ title: searchRegex }, { summary: searchRegex }],
    })
      .populate("tags")
      .sort({ updatedAt: -1 })
      .limit(20)

    const tags = await Tag.find({ name: searchRegex }).limit(10)

    res.json({ pages, tags })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Quick search (for autocomplete)
router.get("/quick", async (req, res) => {
  try {
    const { q } = req.query

    if (!q || q.trim() === "") {
      return res.json([])
    }

    const searchRegex = new RegExp(q, "i")

    const pages = await Page.find({ title: searchRegex }).select("title type icon").limit(5)

    res.json(pages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
