import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ProgramsPage from './pages/ProgramsPage'
import ProgramDetailPage from './pages/ProgramDetailPage'
import TeamPage from './pages/TeamPage'
import NewsPage from './pages/NewsPage'
import ResourcesPage from './pages/ResourcesPage'
import FeaturedPage from './pages/FeaturedPage'
import PartnersPage from './pages/PartnersPage'
import PartnershipRequestPage from './pages/PartnershipRequestPage'
import SponsorshipRequestPage from './pages/SponsorshipRequestPage'
import JoinPage from './pages/JoinPage'
import ContactPage from './pages/ContactPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Layout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/:id" element={<ProgramDetailPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/featured" element={<FeaturedPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/partners/partnership-request" element={<PartnershipRequestPage />} />
        <Route path="/partners/sponsorship-request" element={<SponsorshipRequestPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}