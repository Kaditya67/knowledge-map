import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "https://knowledge-map-liard.vercel.app/api" || "/api"

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const api = {
  // Auth
  register: async (userData) => {
    const { data } = await client.post("/auth/register", userData)
    return data
  },

  // Media
  getMedia: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.type && filters.type !== "all") params.append("type", filters.type)
    if (filters.status && filters.status !== "all") params.append("status", filters.status)
    if (filters.sort) params.append("sort", filters.sort)
    const response = await client.get(`/media?${params}`)
    return response.data
  },
  createMedia: async (data) => {
    const response = await client.post("/media", data)
    return response.data
  },
  updateMedia: async (id, data) => {
    const response = await client.put(`/media/${id}`, data)
    return response.data
  },
  deleteMedia: async (id) => {
    const response = await client.delete(`/media/${id}`)
    return response.data
  },
  batchUpdateMedia: async (items) => {
    const response = await client.put("/media/batch", { 
      ids: items.map(i => i._id), 
      items: items 
    })
    return response.data
  },
  getMediaStats: async (type) => {
    const params = new URLSearchParams()
    if (type && type !== "all") params.append("type", type)
    const response = await client.get(`/media/stats?${params}`)
    return response.data
  },

  // Media Config
  getMediaConfig: async () => {
    const response = await client.get("/media-config")
    return response.data
  },
  updateMediaConfig: async (data) => {
    const response = await client.put("/media-config", data)
    return response.data
  },

  login: async (userData) => {
    const { data } = await client.post("/auth/login", userData)
    return data
  },

  getMe: async () => {
    const { data } = await client.get("/auth/me")
    return data
  },

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
