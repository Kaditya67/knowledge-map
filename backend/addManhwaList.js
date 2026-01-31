import mongoose from "mongoose"
import dotenv from "dotenv"
import Media from "./models/Media.js"

dotenv.config()

const manhwaList = [
  {
    title: "The great mage returns after 4000 years",
    current: 87,
    total: 0,
    link: "https://mangapark.com/title/100612-en-the-great-mage-returns-after-4000-years"
  },
  {
    title: "The Beginning after the End",
    current: 83,
    total: 0,
    link: "https://ww9.thebeginningaftertheendmanga.com/"
  },
  {
    title: "Dungeon Reset",
    current: 66,
    total: 0,
    link: "https://dungeon-reset.xyz/"
  },
  {
    title: "My Dad is too Strong",
    current: 60,
    total: 0,
    link: "https://en-thunderscans.com/comics/my-dad-is-too-strong/"
  },
  {
    title: "Player who can't level up",
    current: 58,
    total: 0,
    link: "https://asuracomic.net/series/player-who-cant-level-up-efc11102"
  },
  {
    title: "Homeless/No Home",
    current: 40,
    total: 0,
    link: "https://nohomemanhwa.online/"
  },
  {
    title: "I am the Queen in this life",
    current: 37,
    total: 0,
    link: "https://www.webtoons.com/en/fantasy/im-the-queen-in-this-life/episode-37/viewer?title_no=4886&episode_no=37"
  },
  {
    title: "The fist fighting genius mage",
    current: 12,
    total: 0,
    link: "https://www.webtoons.com/en/action/the-fistfighting-genius-mage/episode-12/viewer?title_no=8018&episode_no=12"
  }
];

const addManhwa = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ MongoDB connected\n")
    console.log("Starting to add manhwa items...\n")

    let successCount = 0
    let errorCount = 0

    for (const item of manhwaList) {
      const mediaData = {
        type: "Manhwa",
        title: item.title,
        current: item.current,
        total: item.total || 0,
        unit: "Ch",
        status: "planning",
        rating: 8,
        link: item.link,
        coverImage: item.coverImage || "",
        notes: item.notes || "",
        genres: item.genres || ["Action"],
        tags: item.tags || [],
        favorite: false
      }

      try {
        // Check if already exists
        const existing = await Media.findOne({ title: item.title, type: "Manhwa" })
        if (existing) {
          console.log(`⏭️  Skipped: ${item.title} (already exists)`)
          continue
        }

        await Media.create(mediaData)
        console.log(`✅ Added: ${item.title} (Ch ${item.current})`)
        successCount++
      } catch (error) {
        console.log(`❌ Failed: ${item.title} - ${error.message}`)
        errorCount++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Successfully added: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📚 Total: ${manhwaList.length}`)

    process.exit()
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

addManhwa()
