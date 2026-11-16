import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HRProvider } from './context/HRContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Candidates from './pages/Candidates'
import UploadResume from './pages/UploadResume'
import Pipeline from './pages/Pipeline'
import Offers from './pages/Offers'

export default function App() {
  return (
    <HRProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="upload" element={<UploadResume />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="offers" element={<Offers />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HRProvider>
  )
}
