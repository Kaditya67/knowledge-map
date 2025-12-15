import mongoose from "mongoose"

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["concept", "setup", "project", "custom"],
      default: "concept",
    },
    summary: {
      type: String,
      trim: true,
      default: "",
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    relatedPages: [
      {
        page: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Page",
        },
        relationshipType: {
          type: String,
          enum: ["used_in", "depends_on", "related_to"],
          default: "related_to",
        },
      },
    ],
    blocks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Block",
      },
    ],
    icon: {
      type: String,
      default: "📄",
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Index for search
pageSchema.index({ title: "text", summary: "text" })

const Page = mongoose.model("Page", pageSchema)
export default Page
