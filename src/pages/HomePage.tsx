import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getGames, GameConfig } from '../services/storage'

function HomePage() {
  const [games, setGames] = useState<GameConfig[]>([])

  useEffect(() => {
    setGames(getGames().filter(g => g.enabled).sort((a, b) => a.order - b.order))
  }, [])

  return (
    <div className="home-page">
      <Link to="/teacher" className="teacher-link">
        👩‍🏫 หน้าครู
      </Link>
      
      <h1 className="home-title">🎨 ห้องเรียนสนุก 🎮</h1>
      
      <div className="game-cards">
        {games.map(game => (
          <Link key={game.id} to={game.path} className="game-card">
            <div className="game-icon">{game.icon}</div>
            <h2>{game.name}</h2>
            <p>{game.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomePage
