import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import BreakingTicker from './components/BreakingTicker'
import Footer from './components/Footer'
import LiveFeed from './pages/LiveFeed'
import Dashboard from './pages/Dashboard'
import SocialPulse from './pages/SocialPulse'
import LiveVideo from './pages/LiveVideo'
import Geopolitics from './pages/Geopolitics'
import Sources from './pages/Sources'

export default function App() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <Routes>
        <Route path="/" element={<LiveFeed />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/social" element={<SocialPulse />} />
        <Route path="/video" element={<LiveVideo />} />
        <Route path="/geopolitics" element={<Geopolitics />} />
        <Route path="/sources" element={<Sources />} />
      </Routes>
      <Footer />
      <BreakingTicker />
    </div>
  )
}
