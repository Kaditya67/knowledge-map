import mongoose from "mongoose"

const mediaConfigSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      unique: false,
    },
    customTypes: [
      {
        name: { type: String, required: true }, // e.g., "Anime"
        unit: { type: String, default: "Ep" },  // e.g., "Ep"
        totalLabel: { type: String, default: "Total Eps" }, // e.g., "Total Eps"
      },
    ],
    customStatuses: [
      {
        value: { type: String, required: true }, // e.g., "planning"
        label: { type: String, required: true }, // e.g., "Planning"
        color: { type: String, default: "#64748b" }, // e.g., Slate
      },
    ],
  },
  {
    timestamps: true,
  }
)

const MediaConfig = mongoose.model("MediaConfig", mediaConfigSchema)
export default MediaConfig
