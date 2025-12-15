import express from "express"
import Block from "../models/Block.js"
import Page from "../models/Page.js"

const router = express.Router()

// Get blocks for a page
router.get("/page/:pageId", async (req, res) => {
  try {
    const blocks = await Block.find({ pageId: req.params.pageId }).sort({ order: 1 })
    res.json(blocks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single block
router.get("/:id", async (req, res) => {
  try {
    const block = await Block.findById(req.params.id)
    if (!block) {
      return res.status(404).json({ error: "Block not found" })
    }
    res.json(block)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create block
router.post("/", async (req, res) => {
  try {
    const { pageId, type, content, order } = req.body

    let blockOrder = order
    if (blockOrder === undefined) {
      const lastBlock = await Block.findOne({ pageId }).sort({ order: -1 })
      blockOrder = lastBlock ? lastBlock.order + 1 : 0
    }

    const block = new Block({
      pageId,
      type,
      content,
      order: blockOrder,
    })

    await block.save()
    await Page.findByIdAndUpdate(pageId, { $push: { blocks: block._id } })

    res.status(201).json(block)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update block
router.put("/:id", async (req, res) => {
  try {
    const { type, content, order } = req.body

    const block = await Block.findByIdAndUpdate(req.params.id, { type, content, order }, { new: true })

    if (!block) {
      return res.status(404).json({ error: "Block not found" })
    }

    res.json(block)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete block
router.delete("/:id", async (req, res) => {
  try {
    const block = await Block.findByIdAndDelete(req.params.id)

    if (!block) {
      return res.status(404).json({ error: "Block not found" })
    }

    await Page.findByIdAndUpdate(block.pageId, { $pull: { blocks: block._id } })
    res.json({ message: "Block deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Reorder blocks
router.patch("/reorder", async (req, res) => {
  try {
    const { pageId, blockOrders } = req.body

    const updatePromises = blockOrders.map(({ id, order }) => Block.findByIdAndUpdate(id, { order }))

    await Promise.all(updatePromises)
    const blocks = await Block.find({ pageId }).sort({ order: 1 })
    res.json(blocks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
