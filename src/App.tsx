import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PlayColoring from './pages/Student/PlayColoring'
import PlayPuzzle from './pages/Student/PlayPuzzle'
import PlayMatching from './pages/Student/PlayMatching'
import PlayBeads from './pages/Student/PlayBeads'
import PlayShadow from './pages/Student/PlayShadow'
import Dashboard from './pages/Teacher/Dashboard'
import ManageMatching from './pages/Teacher/ManageMatching'
import ManageShadow from './pages/Teacher/ManageShadow'
import ManagePuzzle from './pages/Teacher/ManagePuzzle'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/coloring" element={<PlayColoring />} />
        <Route path="/puzzle" element={<PlayPuzzle />} />
        <Route path="/matching" element={<PlayMatching />} />
        <Route path="/beads" element={<PlayBeads />} />
        <Route path="/shadow" element={<PlayShadow />} />
        <Route path="/teacher" element={<Dashboard />} />
        <Route path="/teacher/matching" element={<ManageMatching />} />
        <Route path="/teacher/shadow" element={<ManageShadow />} />
        <Route path="/teacher/puzzle" element={<ManagePuzzle />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
