import express from "express"
import Page from "../models/Page.js"
import Block from "../models/Block.js"

const router = express.Router()

// Get all pages
router.get("/", async (req, res) => {
  try {
    const { type, tag, favorite } = req.query
    const query = {}

    if (type && type !== "all") query.type = type
    if (favorite === "true") query.isFavorite = true
    if (tag) query.tags = tag

    const pages = await Page.find(query).populate("tags").sort({ updatedAt: -1 })
    res.json(pages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single page with blocks
router.get("/:id", async (req, res) => {
  try {
    const page = await Page.findById(req.params.id).populate("tags").populate({
      path: "relatedPages.page",
      select: "title type icon",
    })

    if (!page) {
      return res.status(404).json({ error: "Page not found" })
    }

    const blocks = await Block.find({ pageId: page._id }).sort({ order: 1 })
    res.json({ ...page.toObject(), blocks })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create page
router.post("/", async (req, res) => {
  try {
    const { title, type, summary, tags, icon } = req.body

    const page = new Page({
      title,
      type: type || "concept",
      summary: summary || "",
      tags: tags || [],
      icon: icon || "📄",
    })

    await page.save()
    const populatedPage = await Page.findById(page._id).populate("tags")
    res.status(201).json(populatedPage)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update page
router.put("/:id", async (req, res) => {
  try {
    const { title, type, summary, tags, icon, isFavorite, relatedPages } = req.body

    const page = await Page.findByIdAndUpdate(
      req.params.id,
      { title, type, summary, tags, icon, isFavorite, relatedPages },
      { new: true },
    ).populate("tags")

    if (!page) {
      return res.status(404).json({ error: "Page not found" })
    }

    res.json(page)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete page
router.delete("/:id", async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id)

    if (!page) {
      return res.status(404).json({ error: "Page not found" })
    }

    await Block.deleteMany({ pageId: req.params.id })
    res.json({ message: "Page deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Toggle favorite
router.patch("/:id/favorite", async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)

    if (!page) {
      return res.status(404).json({ error: "Page not found" })
    }

    page.isFavorite = !page.isFavorite
    await page.save()
    res.json(page)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
