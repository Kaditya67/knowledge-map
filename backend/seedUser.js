import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./models/User.js"

dotenv.config()

const seedUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("MongoDB connected")

    const email = "ojhaaditya913@gmail.com"
    const password = "Kaditya@67"
    const username = "Aditya"

    const userExists = await User.findOne({ email })

    if (userExists) {
      console.log("User already exists, updating password...")
      userExists.password = password // Will be hashed by pre-save hook
      await userExists.save()
      console.log("User updated successfully")
    } else {
      console.log("Creating new user...")
      await User.create({
        username,
        email,
        password,
      })
      console.log("User created successfully")
    }

    process.exit()
  } catch (error) {
    console.error("Error seeding user:", error)
    process.exit(1)
  }
}

seedUser()
