import axios from "axios"

const API_URL = "https://knowledge-map-liard.vercel.app/api" || import.meta.env.VITE_API_URL || "/api"

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

const api = {
  // Pages
  getPages: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.type && filters.type !== "all") params.append("type", filters.type)
    if (filters.favorite) params.append("favorite", "true")
    if (filters.tag) params.append("tag", filters.tag)

    const { data } = await client.get(`/pages?${params}`)
    return data
  },

  getPage: async (id) => {
    const { data } = await client.get(`/pages/${id}`)
    return data
  },

  createPage: async (pageData) => {
    const { data } = await client.post("/pages", pageData)
    return data
  },

  updatePage: async (id, pageData) => {
    const { data } = await client.put(`/pages/${id}`, pageData)
    return data
  },

  deletePage: async (id) => {
    const { data } = await client.delete(`/pages/${id}`)
    return data
  },

  toggleFavorite: async (id) => {
    const { data } = await client.patch(`/pages/${id}/favorite`)
    return data
  },

  // Blocks
  getBlocks: async (pageId) => {
    const { data } = await client.get(`/blocks/page/${pageId}`)
    return data
  },

  createBlock: async (blockData) => {
    const { data } = await client.post("/blocks", blockData)
    return data
  },

  updateBlock: async (id, blockData) => {
    const { data } = await client.put(`/blocks/${id}`, blockData)
    return data
  },

  deleteBlock: async (id) => {
    const { data } = await client.delete(`/blocks/${id}`)
    return data
  },

  reorderBlocks: async (pageId, blockOrders) => {
    const { data } = await client.patch("/blocks/reorder", { pageId, blockOrders })
    return data
  },

  // Tags
  getTags: async () => {
    const { data } = await client.get("/tags")
    return data
  },

  createTag: async (tagData) => {
    const { data } = await client.post("/tags", tagData)
    return data
  },

  updateTag: async (id, tagData) => {
    const { data } = await client.put(`/tags/${id}`, tagData)
    return data
  },

  deleteTag: async (id) => {
    const { data } = await client.delete(`/tags/${id}`)
    return data
  },

  // Search
  search: async (query) => {
    const { data } = await client.get(`/search?q=${encodeURIComponent(query)}`)
    return data
  },

  quickSearch: async (query) => {
    const { data } = await client.get(`/search/quick?q=${encodeURIComponent(query)}`)
    return data
  },
}

export default api
