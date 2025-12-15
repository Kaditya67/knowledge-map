import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext"
import { AppProvider } from "./context/AppContext"
import Layout from "./components/layout/Layout"
import HomePage from "./pages/HomePage"
import PageView from "./pages/PageView"
import PageEditor from "./pages/PageEditor"
import TagsPage from "./pages/TagsPage"
import SearchPage from "./pages/SearchPage"

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/page/:id" element={<PageView />} />
              <Route path="/page/:id/edit" element={<PageEditor />} />
              <Route path="/new" element={<PageEditor />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/search" element={<SearchPage />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
