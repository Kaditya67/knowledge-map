import express from "express"
import Media from "../models/Media.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Get all media (filtered by owner if needed later, but global for now as per app style)
router.get("/", async (req, res) => {
  try {
    const { type, status, sort, search, genres, tags, favorite, minRating, maxRating } = req.query
    const query = {}
    
    // Existing filters
    if (type && type !== "all") query.type = type
    if (status && status !== "all") query.status = status
    
    // Search filter (title or notes)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } }
      ]
    }
    
    // Genre filter
    if (genres) {
      const genreArray = Array.isArray(genres) ? genres : [genres]
      query.genres = { $in: genreArray }
    }
    
    // Tag filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags]
      query.tags = { $in: tagArray }
    }
    
    // Favorite filter
    if (favorite === "true") {
      query.favorite = true
    }
    
    // Rating range filter
    if (minRating || maxRating) {
      query.rating = {}
      if (minRating) query.rating.$gte = Number(minRating)
      if (maxRating) query.rating.$lte = Number(maxRating)
    }

    let sortOptions = { updatedAt: -1 } // Default
    if (sort === "rating") sortOptions = { rating: -1 }
    if (sort === "title") sortOptions = { title: 1 }
    if (sort === "newest") sortOptions = { createdAt: -1 }
    if (sort === "updated") sortOptions = { updatedAt: -1 }

    const media = await Media.find(query).sort(sortOptions)
    res.json(media)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get statistics
router.get("/stats", async (req, res) => {
  try {
    const { type } = req.query
    const query = type && type !== "all" ? { type } : {}
    
    const totalItems = await Media.countDocuments(query)
    const completedItems = await Media.countDocuments({ ...query, status: "completed" })
    const favoriteItems = await Media.countDocuments({ ...query, favorite: true })
    
    // Average rating
    const ratingAgg = await Media.aggregate([
      { $match: { ...query, rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ])
    const avgRating = ratingAgg.length > 0 ? ratingAgg[0].avgRating : 0
    
    // Status breakdown
    const statusBreakdown = await Media.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $count: {} } } }
    ])
    
    // Genre breakdown
    const genreBreakdown = await Media.aggregate([
      { $match: query },
      { $unwind: "$genres" },
      { $group: { _id: "$genres", count: { $count: {} } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
    
    res.json({
      totalItems,
      completedItems,
      favoriteItems,
      completionRate: totalItems > 0 ? (completedItems / totalItems * 100).toFixed(1) : 0,
      avgRating: avgRating.toFixed(1),
      statusBreakdown,
      genreBreakdown
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Batch update media
router.put("/batch", protect, async (req, res) => {
  try {
    const { items } = req.body
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid items array" })
    }
    
    // Update each item individually
    const updatePromises = items.map(item => {
      const { _id, ...updates } = item
      return Media.findByIdAndUpdate(_id, updates, { new: true })
    })
    
    const results = await Promise.all(updatePromises)
    
    res.json({ 
      message: "Batch update successful", 
      modifiedCount: results.filter(r => r !== null).length,
      items: results
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Create media
router.post("/", protect, async (req, res) => {
  try {
    const media = new Media(req.body)
    const savedMedia = await media.save()
    res.status(201).json(savedMedia)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update media
router.put("/:id", protect, async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!media) return res.status(404).json({ error: "Media not found" })
    res.json(media)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete media
router.delete("/:id", protect, async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id)
    if (!media) return res.status(404).json({ error: "Media not found" })
    res.json({ message: "Media deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
