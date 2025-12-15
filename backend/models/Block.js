import mongoose from "mongoose"

const blockSchema = new mongoose.Schema(
  {
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    },
    type: {
      type: String,
      enum: ["markdown", "image", "gallery", "link", "diagram", "note"],
      required: true,
    },
    content: {
      // For markdown: { text: string }
      // For image: { url: string, caption: string }
      // For gallery: { images: [{ url: string, caption: string }] }
      // For link: { url: string, label: string, description: string, linkType: string }
      // For diagram: { url: string, tool: string, title: string }
      // For note: { text: string, noteType: 'info' | 'warning' | 'success' | 'error' }
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for ordering
blockSchema.index({ pageId: 1, order: 1 })

const Block = mongoose.model("Block", blockSchema)
export default Block
