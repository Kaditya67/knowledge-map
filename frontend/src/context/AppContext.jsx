"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../services/api"

const AppContext = createContext()

export function AppProvider({ children }) {
  const [pages, setPages] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPages = useCallback(async (filters = {}) => {
    try {
      setLoading(true)
      const data = await api.getPages(filters)
      setPages(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTags = useCallback(async () => {
    try {
      const data = await api.getTags()
      setTags(data)
    } catch (err) {
      console.error("Failed to fetch tags:", err)
    }
  }, [])

  useEffect(() => {
    fetchPages()
    fetchTags()
  }, [fetchPages, fetchTags])

  const createPage = async (pageData) => {
    const newPage = await api.createPage(pageData)
    setPages((prev) => [newPage, ...prev])
    return newPage
  }

  const updatePage = async (id, pageData) => {
    const updatedPage = await api.updatePage(id, pageData)
    setPages((prev) => prev.map((page) => (page._id === id ? updatedPage : page)))
    return updatedPage
  }

  const deletePage = async (id) => {
    await api.deletePage(id)
    setPages((prev) => prev.filter((page) => page._id !== id))
  }

  const toggleFavorite = async (id) => {
    const updatedPage = await api.toggleFavorite(id)
    setPages((prev) => prev.map((page) => (page._id === id ? updatedPage : page)))
    return updatedPage
  }

  const createTag = async (tagData) => {
    const newTag = await api.createTag(tagData)
    setTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)))
    return newTag
  }

  const updateTag = async (id, tagData) => {
    const updatedTag = await api.updateTag(id, tagData)
    setTags((prev) => prev.map((tag) => (tag._id === id ? updatedTag : tag)))
    return updatedTag
  }

  const deleteTag = async (id) => {
    await api.deleteTag(id)
    setTags((prev) => prev.filter((tag) => tag._id !== id))
  }

  return (
    <AppContext.Provider
      value={{
        pages,
        tags,
        loading,
        error,
        fetchPages,
        fetchTags,
        createPage,
        updatePage,
        deletePage,
        toggleFavorite,
        createTag,
        updateTag,
        deleteTag,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
