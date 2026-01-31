/**
 * Export utilities for media data
 * Supports CSV and JSON formats with customizable fields
 */

/**
 * Convert array data to CSV format
 * @param {Array} data - Array of media objects
 * @param {Array} fields - Array of field names to include
 * @returns {string} CSV formatted string
 */
export function exportToCSV(data, fields) {
  if (!data || data.length === 0) {
    return ''
  }

  // Create header row
  const headers = fields.map(field => field.label).join(',')
  
  // Create data rows
  const rows = data.map(item => {
    return fields.map(field => {
      let value = item[field.key]
      
      // Handle arrays (genres, tags)
      if (Array.isArray(value)) {
        value = value.join('; ')
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        value = ''
      }
      
      // Handle dates
      if (value instanceof Date) {
        value = value.toISOString()
      }
      
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      
      return stringValue
    }).join(',')
  })
  
  return [headers, ...rows].join('\n')
}

/**
 * Convert array data to JSON format
 * @param {Array} data - Array of media objects
 * @param {Array} fields - Array of field names to include
 * @returns {string} JSON formatted string
 */
export function exportToJSON(data, fields) {
  if (!data || data.length === 0) {
    return '[]'
  }

  // Filter data to only include selected fields
  const filteredData = data.map(item => {
    const filtered = {}
    fields.forEach(field => {
      filtered[field.key] = item[field.key]
    })
    return filtered
  })
  
  return JSON.stringify(filteredData, null, 2)
}

/**
 * Trigger browser download of file
 * @param {string} content - File content
 * @param {string} filename - Name of file to download
 * @param {string} mimeType - MIME type of file
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Get available export fields
 * @returns {Array} Array of field objects with key and label
 */
export function getExportFields() {
  return [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'current', label: 'Current Progress' },
    { key: 'total', label: 'Total' },
    { key: 'rating', label: 'Rating' },
    { key: 'genres', label: 'Genres' },
    { key: 'tags', label: 'Tags' },
    { key: 'link', label: 'Link' },
    { key: 'coverImage', label: 'Cover Image URL' },
    { key: 'notes', label: 'Notes' },
    { key: 'favorite', label: 'Favorite' },
    { key: 'createdAt', label: 'Created Date' },
    { key: 'updatedAt', label: 'Updated Date' },
  ]
}

/**
 * Generate filename with timestamp
 * @param {string} section - Section name
 * @param {string} format - File format (csv or json)
 * @returns {string} Filename with timestamp
 */
export function generateFilename(section, format) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const sectionSlug = section.toLowerCase().replace(/\s+/g, '-')
  return `media-export-${sectionSlug}-${timestamp}.${format}`
}
