import mongoose from "mongoose"
import dotenv from "dotenv"
import Media from "./models/Media.js"

dotenv.config()

const manhwaList = [
  {
    title: "I shall master this family",
    current: 190,
    total: 200,
    link: "https://bato.si/title/86408-i-shall-master-this-family-official",
    coverImage: "https://us-a.tapas.io/sa/98/89fcb7ab-df03-4563-a072-3fadea7f4f08_z.jpg",
    notes: "Cool ruling queen",
    genres: ["Action", "Rule", "Isekai"],
    tags: ["Rule"]
  },
  {
    title: "The Heavenly Demon Can't live a normal life",
    current: 176,
    link: "https://mangapark.io/title/127686-en-the-heavenly-demon-can-t-live-a-normal-life"
  },
  {
    title: "Nano Machine",
    current: 145,
    link: "https://mangapark.io/title/101273-en-nano-machine"
  },
  {
    title: "Player who Returned 10,000 years later",
    current: 139,
    link: "https://asuracomic.net/series/player-who-returned-10000-years-later-17680d81"
  },
  {
    title: "Solo Farming in the Tower",
    current: 109,
    link: "https://en-thunderscans.com/comics/solo-farming-in-the-tower/"
  },
  {
    title: "The gardener in a hunter world",
    current: 84,
    link: "https://www.webtoons.com/en/fantasy/the-gardener-in-a-hunter-world/s2-episode-83/viewer?title_no=6220&episode_no=83"
  },
  {
    title: "Magic Level 99990000 all attributes great sage",
    current: 70,
    link: "https://en-thunderscans.com/comics/magic-level-99990000-all-attribute-great-sage/"
  },
  {
    title: "I got the weakest class dragon tamer",
    current: 65,
    link: "https://en-thunderscans.com/comics/0086250808-i-got-the-weakest-class-dragon-tamer/"
  },
  {
    title: "The Archmage's Restaurant",
    current: 60,
    link: "https://mangapark.org/title/381666-en-the-archmage-s-restaurant"
  },
  {
    title: "The Apothecary prince",
    current: 58,
    link: "https://www.webtoons.com/en/fantasy/the-apothecary-prince/episode-58/viewer?title_no=6335&episode_no=58"
  },
  {
    title: "Monster Eater",
    current: 43,
    link: "https://en-thunderscans.com/comics/monster-eater/"
  },
  {
    title: "Auto hunting with clones",
    current: 32,
    link: "https://www.toongod.org/webtoon/auto-hunting-with-clones/"
  },
  {
    title: "Resigning and healing in another world",
    current: 23,
    link: "https://www.webtoons.com/en/fantasy/resigning-and-healing-in-another-world/ep-23-the-lie-detector/viewer?title_no=5264&episode_no=24"
  },
  {
    title: "Goddess of Abundance and the Genius Rogue Apostle",
    current: 21,
    link: "https://en-thunderscans.com/comics/goddess-of-abundance-and-the-genius-rogue-apostle/"
  },
  {
    title: "Return of the first patriarch the strongest reincarnates into his descendant 1000 years later",
    current: 18,
    link: "https://utoon.net/manga/return-of-the-first-patriarch-the-strongest-reincarnates-into-his-descendant-1000-years-later/"
  },
  {
    title: "The Lord of Coins",
    current: 9,
    link: "https://vortexscans.org/series/the-lord-of-coins"
  },
  {
    title: "Dukedom's Legendary Prodigy",
    current: 8,
    link: "https://asuracomic.net/series/dukedoms-legendary-prodigy-2675714e"
  },
  {
    title: "Boundless Necromancer",
    current: 4,
    link: "https://www.toongod.org/webtoon/boundless-necromancer/"
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
        rating: 9,
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
