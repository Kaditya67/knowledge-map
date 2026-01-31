import mongoose from "mongoose"
import dotenv from "dotenv"
import Media from "./models/Media.js"

dotenv.config()

const animeList = [
  {
    title: "I Reincarnated as a Legendary Surgeon",
    current: 102,
    link: "https://mangapark.io/title/234200-en-i-reincarnated-as-a-legendary-surgeon"
  },
  {
    title: "The Infinite Mage",
    current: 76,
    link: "https://mangapark.org/title/264203-en-the-infinite-mage"
  },
  {
    title: "SSS Class Suicide Hunter",
    current: 66,
    link: "https://www.toongod.org/webtoon/sss-class-suicide-hunter/"
  },
  {
    title: "Doctor's Rebirth",
    current: 61,
    link: "https://www.toongod.org/webtoon/doctors-rebirth/"
  },
  {
    title: "My Blasted Reincarnated Life",
    current: 50,
    link: "https://mangapark.org/title/247440-en-my-blasted-reincarnated-life"
  },
  {
    title: "The Chef Hides His Blessings",
    current: 41,
    link: "https://mangapark.io/title/101932-en-the-chef-hides-his-blessing"
  },
  {
    title: "From Goblin to Goblin God",
    current: 38,
    link: "https://mangapark.org/title/412848-en-from-goblin-to-goblin-god"
  },
  {
    title: "Healing Life Through Camping in Another World",
    current: 31,
    link: "https://mangapark.org/title/408286-en-healing-life-through-camping-in-another-world"
  },
  {
    title: "The Max Level Hero Has Returned",
    current: 28,
    link: "https://asuracomic.net/series/the-max-level-hero-has-returned-02019c69"
  },
  {
    title: "Swordmaster's Youngest Son",
    current: 25,
    link: "https://mangapark.org/title/242578-en-swordmaster-s-youngest-son"
  },
  {
    title: "Revenge of the Iron Blooded Sword Hound",
    current: 19,
    link: "https://asuracomic.net/series/revenge-of-the-iron-blooded-sword-hound-655d0967"
  },
  {
    title: "Return of the SSS Class Ranker",
    current: 19,
    link: "https://www.toongod.org/webtoon/return-of-the-sss-class-ranker/"
  },
  {
    title: "Dungeon Odyssey",
    current: 17,
    link: "https://mangapark.org/title/255437-en-dungeon-odyssey"
  },
  {
    title: "Pick Me Up Infinite Gacha",
    current: 15,
    link: "https://asuracomic.net/series/pick-me-up-infinite-gacha-5f9a65fb"
  },
  {
    title: "66666 Years Advent of the Dark Mage",
    current: 12,
    link: "https://www.webtoons.com/en/fantasy/66666-years-advent-of-the-dark-mage/ep-12-the-nature-revealed/viewer?title_no=3441&episode_no=12"
  },
  {
    title: "Omniscient Reader's Viewpoint",
    current: 10,
    link: "https://www.webtoons.com/en/action/omniscient-reader"
  },
  {
    title: "Solo Max-Level Newbie",
    current: 9,
    link: "https://mangapark.io/title/220941-en-solo-max-level-newbie"
  },
  {
    title: "I Grow by Eating",
    current: 4,
    link: "https://asurascanz.com/manga/i-grow-stronger-by-eating/?2025-12-21"
  },
  {
    title: "Eternally Regressing Knight",
    current: 4,
    link: "https://mangapark.io/title/408288-en-eternally-regressing-knight"
  }
]

const addAnime = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ MongoDB connected\n")
    console.log("Starting to add anime items...\n")

    let successCount = 0
    let errorCount = 0

    for (const item of animeList) {
      const mediaData = {
        type: "Manhwa",
        title: item.title,
        current: item.current,
        total: 0,
        unit: "Ch",
        status: "paused",
        rating: 7,
        link: item.link,
        coverImage: "",
        notes: "",
        genres: ["Fantasy", "Action"],
        tags: ["Reading"],
        favorite: false
      }

      try {
        // Check if already exists
        const existing = await Media.findOne({ title: item.title })
        
        if (existing) {
          console.log(`⏭️  Skipped: "${item.title}" (already exists)`)
          continue
        }

        await Media.create(mediaData)
        console.log(`✅ Added: "${item.title}" - Chapter ${item.current}`)
        successCount++
      } catch (error) {
        console.log(`❌ Failed: ${item.title} - ${error.message}`)
        errorCount++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Successfully added: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📚 Total: ${animeList.length}`)

    process.exit()
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

addAnime()
