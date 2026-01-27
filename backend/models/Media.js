import mongoose from "mongoose"

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String, 
      required: true,
      // Removed enum to accept custom types like "Podcast" or "Webtoon"
    },
    link: {
      type: String,
      trim: true,
    },
    current: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0, 
    },
    unit: {
      type: String,
      default: "ep", 
    },
    status: {
      type: String,
      // Removed enum to accept custom statuses like "On Hold"
      default: "planning",
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    image: {
      type: String,
    },
    notes: {
      type: String,
    },
    genres: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    lastViewed: {
      type: Date,
    },
    coverImage: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

const Media = mongoose.model("Media", mediaSchema)
export default Media
