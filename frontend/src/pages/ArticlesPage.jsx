import { useState, useEffect } from "react"
import {
  BookOpen,
  ExternalLink,
  Calendar,
  Tag,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  Share2,
  Clock,
  Sparkles
} from "lucide-react"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"

export default function ArticlesPage() {
  const [feedData, setFeedData] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState("all")
  const [activeArticle, setActiveArticle] = useState(null) // When reading in-app

  const MEDIUM_USERNAME = "kaditya67"
  const RSS_ENDPOINT = `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${MEDIUM_USERNAME}`

  const fetchMediumArticles = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(RSS_ENDPOINT)
      const data = await res.json()

      if (data.status !== "ok") {
        throw new Error("Failed to load Medium stories")
      }

      setFeedData(data.feed)
      setArticles(data.items || [])
    } catch (err) {
      console.error(err)
      setError("Unable to fetch Medium articles. Please check your network connection.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMediumArticles()
  }, [])

  // Extract all categories/tags across articles
  const allTags = Array.from(
    new Set(articles.flatMap(a => a.categories || []))
  ).sort()

  const filteredArticles = articles.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (selectedTag !== "all") {
      return item.categories && item.categories.includes(selectedTag)
    }

    return true
  })

  // Format date helper
  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString)
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    } catch {
      return dateString
    }
  }

  // Extract first image from HTML description if thumbnail is empty
  const getArticleImage = (item) => {
    if (item.thumbnail && item.thumbnail.startsWith("http")) {
      return item.thumbnail
    }
    const match = item.description?.match(/<img[^>]+src="([^">]+)"/)
    return match ? match[1] : null
  }

  // Strip HTML for clean snippets
  const getCleanSnippet = (html) => {
    if (!html) return ""
    const text = html.replace(/<[^>]*>?/gm, "").trim()
    return text.slice(0, 180) + (text.length > 180 ? "..." : "")
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* If reading an individual article in-app */}
      {activeArticle ? (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {/* Top navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveArticle(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Articles List
            </button>

            <a
              href={activeArticle.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Read on Medium
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Reader Article View */}
          <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">
            <div className="space-y-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap gap-2">
                {activeArticle.categories?.map(cat => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold capitalize"
                  >
                    #{cat}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {activeArticle.title}
              </h1>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(activeArticle.pubDate)}
                </span>
                <span>•</span>
                <span>By {activeArticle.author || "Aditya Ojha"}</span>
              </div>
            </div>

            {/* Injected Medium HTML Body */}
            <div
              className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: activeArticle.content || activeArticle.description }}
            />
          </article>
        </div>
      ) : (
        /* Regular Feed View */
        <>
          {/* Header Profile Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-5">
                {feedData?.image ? (
                  <img
                    src={feedData.image}
                    alt="Medium Profile"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                    AO
                  </div>
                )}
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-indigo-300 mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Medium Publications</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {feedData?.title || "Aditya Ojha's Articles"}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                    Algorithms, Linux systems, backend engineering, and technical problem solving.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchMediumArticles}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                  title="Refresh articles"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  Sync
                </button>
                <a
                  href={`https://medium.com/@${MEDIUM_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <span>Follow on Medium</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Search & Tag Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Tag Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <button
                onClick={() => setSelectedTag("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTag === "all"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                All Topics ({articles.length})
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedTag === tag
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Feed List / Grid */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">Fetching articles from Medium feed...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl max-w-md mx-auto">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <Button onClick={fetchMediumArticles} size="sm" className="mt-3">
                Retry
              </Button>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 dark:text-white">No articles matched</h3>
              <p className="text-xs text-slate-400 mt-1">Try another search query or tag filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => {
                const imgUrl = getArticleImage(article)
                const snippet = getCleanSnippet(article.description)

                return (
                  <div
                    key={article.guid || article.link}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview Banner */}
                      {imgUrl && (
                        <div className="w-full h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                          <img
                            src={imgUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="p-5">
                        {/* Meta Date & Categories */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-2.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.pubDate)}
                          </span>
                          {article.categories?.[0] && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold capitalize">
                              #{article.categories[0]}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3
                          onClick={() => setActiveArticle(article)}
                          className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 cursor-pointer mb-2"
                        >
                          {article.title}
                        </h3>

                        {/* Snippet */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {snippet}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => setActiveArticle(article)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>Read in Hub</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        title="Open on Medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

    </div>
  )
}
