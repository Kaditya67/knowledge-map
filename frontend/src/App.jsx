import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext"
import { AppProvider } from "./context/AppContext"
import { AuthProvider } from "./context/AuthContext"
import Layout from "./components/layout/Layout"
import HomePage from "./pages/HomePage"
import PageView from "./pages/PageView"
import PageEditor from "./pages/PageEditor"
import TagsPage from "./pages/TagsPage"
import SearchPage from "./pages/SearchPage"
import MediaPage from "./pages/MediaPage"
import LoginPage from "./pages/LoginPage"
import SettingsPage from "./pages/SettingsPage"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/page/:id" element={<PageView />} />
                <Route path="/page/:id/edit" element={<PageEditor />} />
                <Route path="/new" element={<PageEditor />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/media" element={<MediaPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </Router>
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
