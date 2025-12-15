import mongoose from "mongoose"

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
    pageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

tagSchema.index({ name: "text" })

const Tag = mongoose.model("Tag", tagSchema)
export default Tag
