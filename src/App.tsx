import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import BottomTicker from './components/layout/BottomTicker'
import Footer from './components/layout/Footer'
import CommandCenter from './pages/CommandCenter'
import LiveFeed from './pages/LiveFeed'
import Dashboard from './pages/Dashboard'
import SocialPulse from './pages/SocialPulse'
import LiveVideo from './pages/LiveVideo'
import Geopolitics from './pages/Geopolitics'
import BusinessImpact from './pages/BusinessImpact'
import Sources from './pages/Sources'

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-14 sm:pb-12">
      <Navbar />
      <Routes>
        <Route path="/" element={<CommandCenter />} />
        <Route path="/feed" element={<LiveFeed />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/social" element={<SocialPulse />} />
        <Route path="/video" element={<LiveVideo />} />
        <Route path="/geopolitics" element={<Geopolitics />} />
        <Route path="/business" element={<BusinessImpact />} />
        <Route path="/sources" element={<Sources />} />
      </Routes>
      <Footer />
      <BottomTicker />
    </div>
  )
}
