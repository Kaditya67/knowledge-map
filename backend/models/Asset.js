import mongoose from "mongoose"

const assetSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["medium", "github", "drive", "diagram", "pdf", "video", "other"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
    },
  },
  {
    timestamps: true,
  },
)

const Asset = mongoose.model("Asset", assetSchema)
export default Asset
