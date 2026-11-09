import express from "express"
import Provider from "../models/Provider.js"
import Media from "../models/Media.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Known provider patterns for URL domain matching
const DEFAULT_PROVIDER_RULES = [
  { name: "Asura Scans", domains: ["asuracomic.net", "asura.gg", "asurascans.com", "asura"], color: "#9333ea" },
  { name: "Thunder Scans", domains: ["en-thunderscans.com", "thunderscans.com", "thunderscans"], color: "#eab308" },
  { name: "MangaPark", domains: ["mangapark.net", "mangapark.org", "mangapark.io", "mangapark.com", "mangapark"], color: "#f97316" },
  { name: "Webtoons", domains: ["webtoons.com", "webtoon"], color: "#00dc64" },
  { name: "ToonGod", domains: ["toongod.org", "toongod.com", "toongod"], color: "#ec4899" },
  { name: "Reaper Scans", domains: ["reaperscans.com", "reaper"], color: "#ef4444" },
  { name: "Flame Comics", domains: ["flamecomics.com", "flamescans.org"], color: "#f59e0b" },
  { name: "MangaDex", domains: ["mangadex.org"], color: "#ff6740" },
  { name: "Crunchyroll", domains: ["crunchyroll.com"], color: "#f47521" },
  { name: "Netflix", domains: ["netflix.com"], color: "#e50914" },
  { name: "HiAnime", domains: ["hianime.to", "aniwatch.to", "zoro.to"], color: "#ffbade" },
]

// Helper to deduce provider name from link
export const extractProviderFromUrl = (url) => {
  if (!url || typeof url !== "string") return null
  const cleanUrl = url.toLowerCase()
  for (const p of DEFAULT_PROVIDER_RULES) {
    if (p.domains.some(d => cleanUrl.includes(d))) {
      return p.name
    }
  }
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`)
    const hostParts = parsed.hostname.replace("www.", "").split(".")
    if (hostParts.length > 0 && hostParts[0]) {
      return hostParts[0].charAt(0).toUpperCase() + hostParts[0].slice(1)
    }
  } catch (e) {
    // not a valid URL
  }
  return null
}

// Get all providers
router.get("/", async (req, res) => {
  try {
    const providers = await Provider.find().sort({ name: 1 })
    res.json(providers)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get provider statistics breakdown by media type (Anime, Manhwa, Manga, etc.)
router.get("/stats", async (req, res) => {
  try {
    const [providers, allMedia] = await Promise.all([
      Provider.find().lean(),
      Media.find({}, "title type link provider").lean()
    ])

    // Build map of registered providers
    const providerMap = new Map()

    providers.forEach(p => {
      providerMap.set(p.name.toLowerCase(), {
        _id: p._id,
        name: p.name,
        displayName: p.displayName || p.name,
        url: p.url,
        domains: p.domains || [],
        color: p.color || "#6366f1",
        icon: p.icon || "Globe",
        countsByType: {},
        totalCount: 0,
      })
    })

    // Process each media item to map to provider
    allMedia.forEach(item => {
      let matchedProviderName = null

      if (item.provider && item.provider.trim()) {
        matchedProviderName = item.provider.trim()
      } else if (item.link) {
        matchedProviderName = extractProviderFromUrl(item.link)
      }

      if (!matchedProviderName) {
        matchedProviderName = "Other / Direct"
      }

      const key = matchedProviderName.toLowerCase()
      if (!providerMap.has(key)) {
        // Find default color if known rule
        const rule = DEFAULT_PROVIDER_RULES.find(r => r.name.toLowerCase() === key)
        providerMap.set(key, {
          name: matchedProviderName,
          displayName: matchedProviderName,
          color: rule ? rule.color : "#64748b",
          icon: "Globe",
          domains: rule ? rule.domains : [],
          countsByType: {},
          totalCount: 0,
          isAutoDetected: true,
        })
      }

      const entry = providerMap.get(key)
      const mediaType = item.type || "Other"
      entry.countsByType[mediaType] = (entry.countsByType[mediaType] || 0) + 1
      entry.totalCount += 1
    })

    const results = Array.from(providerMap.values()).sort((a, b) => b.totalCount - a.totalCount)

    res.json({
      providers: results,
      totalMediaCount: allMedia.length,
      totalProvidersCount: results.length
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create provider
router.post("/", protect, async (req, res) => {
  try {
    const { name, displayName, url, domains, color, icon, notes } = req.body

    const existing = await Provider.findOne({ name: name.trim() })
    if (existing) {
      return res.status(400).json({ error: "Provider with this name already exists" })
    }

    const provider = new Provider({
      name: name.trim(),
      displayName: displayName?.trim() || name.trim(),
      url: url?.trim() || "",
      domains: Array.isArray(domains) ? domains : (domains ? domains.split(",").map(d => d.trim().toLowerCase()) : []),
      color: color || "#6366f1",
      icon: icon || "Globe",
      notes: notes || "",
    })

    const saved = await provider.save()
    res.status(201).json(saved)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update provider
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, displayName, url, domains, color, icon, notes } = req.body

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(displayName && { displayName: displayName.trim() }),
      ...(url !== undefined && { url: url.trim() }),
      ...(domains !== undefined && { 
        domains: Array.isArray(domains) ? domains : domains.split(",").map(d => d.trim().toLowerCase()) 
      }),
      ...(color && { color }),
      ...(icon && { icon }),
      ...(notes !== undefined && { notes }),
    }

    const provider = await Provider.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!provider) return res.status(404).json({ error: "Provider not found" })

    res.json(provider)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete provider
router.delete("/:id", protect, async (req, res) => {
  try {
    const provider = await Provider.findByIdAndDelete(req.params.id)
    if (!provider) return res.status(404).json({ error: "Provider not found" })

    res.json({ message: "Provider deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
