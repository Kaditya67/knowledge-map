import mongoose from "mongoose"

const providerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    domains: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      default: "#6366f1",
    },
    icon: {
      type: String,
      default: "Globe",
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

providerSchema.index({ name: "text", displayName: "text" })

const Provider = mongoose.model("Provider", providerSchema)
export default Provider
