import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    const user = await User.create({
      username,
      email,
      password,
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
        token: generateToken(user._id),
      })
    } else {
      res.status(400).json({ message: "Invalid user data" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
        token: generateToken(user._id),
      })
    } else {
      res.status(401).json({ message: "Invalid email or password" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    preferences: req.user.preferences,
  })
})

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
router.put("/preferences", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (user) {
      user.preferences = {
        ...user.preferences,
        ...req.body
      }
      const updatedUser = await user.save()
      res.json(updatedUser.preferences)
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
