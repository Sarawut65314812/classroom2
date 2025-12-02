import { useState, useEffect } from 'react'
import MatchingBoard from '../../components/MatchingBoard'
import { audioManager } from '../../utils/audio'
import { getMatchingPairs } from '../../services/storage'
import './PlayMatching.css'

interface MatchPair {
  id: number
  leftImage: string
  rightImage: string
  leftText?: string
  rightText?: string
}

function PlayMatching() {
  const [started, setStarted] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [storedPairs, setStoredPairs] = useState<MatchPair[]>([])

  useEffect(() => {
    const pairs = getMatchingPairs()
    setStoredPairs(pairs.map(p => ({
      id: parseInt(p.id),
      leftImage: p.leftImage,
      rightImage: p.rightImage,
      leftText: p.leftText,
      rightText: p.rightText
    })))
  }, [])

  // Sample pairs for demo (fallback)
  const samplePairs: { [key: string]: MatchPair[] } = {
    easy: [
      { id: 1, leftImage: 'https://via.placeholder.com/100/FF6B6B/fff?text=🍎', rightImage: 'https://via.placeholder.com/100/FF6B6B/fff?text=แอปเปิ้ล', leftText: '🍎', rightText: 'แอปเปิ้ล' },
      { id: 2, leftImage: 'https://via.placeholder.com/100/4ECDC4/fff?text=🍌', rightImage: 'https://via.placeholder.com/100/4ECDC4/fff?text=กล้วย', leftText: '🍌', rightText: 'กล้วย' },
      { id: 3, leftImage: 'https://via.placeholder.com/100/45B7D1/fff?text=🍇', rightImage: 'https://via.placeholder.com/100/45B7D1/fff?text=องุ่น', leftText: '🍇', rightText: 'องุ่น' }
    ],
    medium: [
      { id: 1, leftImage: 'https://via.placeholder.com/100/FF6B6B/fff?text=1', rightImage: 'https://via.placeholder.com/100/FF6B6B/fff?text=One', leftText: '1', rightText: 'One' },
      { id: 2, leftImage: 'https://via.placeholder.com/100/4ECDC4/fff?text=2', rightImage: 'https://via.placeholder.com/100/4ECDC4/fff?text=Two', leftText: '2', rightText: 'Two' },
      { id: 3, leftImage: 'https://via.placeholder.com/100/45B7D1/fff?text=3', rightImage: 'https://via.placeholder.com/100/45B7D1/fff?text=Three', leftText: '3', rightText: 'Three' },
      { id: 4, leftImage: 'https://via.placeholder.com/100/F7DC6F/000?text=4', rightImage: 'https://via.placeholder.com/100/F7DC6F/000?text=Four', leftText: '4', rightText: 'Four' },
      { id: 5, leftImage: 'https://via.placeholder.com/100/BB8FCE/fff?text=5', rightImage: 'https://via.placeholder.com/100/BB8FCE/fff?text=Five', leftText: '5', rightText: 'Five' }
    ],
    hard: [
      { id: 1, leftImage: 'https://via.placeholder.com/100/FF6B6B/fff?text=🐶', rightImage: 'https://via.placeholder.com/100/FF6B6B/fff?text=Dog', leftText: '🐶', rightText: 'Dog' },
      { id: 2, leftImage: 'https://via.placeholder.com/100/4ECDC4/fff?text=🐱', rightImage: 'https://via.placeholder.com/100/4ECDC4/fff?text=Cat', leftText: '🐱', rightText: 'Cat' },
      { id: 3, leftImage: 'https://via.placeholder.com/100/45B7D1/fff?text=🐭', rightImage: 'https://via.placeholder.com/100/45B7D1/fff?text=Mouse', leftText: '🐭', rightText: 'Mouse' },
      { id: 4, leftImage: 'https://via.placeholder.com/100/F7DC6F/000?text=🐰', rightImage: 'https://via.placeholder.com/100/F7DC6F/000?text=Rabbit', leftText: '🐰', rightText: 'Rabbit' },
      { id: 5, leftImage: 'https://via.placeholder.com/100/BB8FCE/fff?text=🐻', rightImage: 'https://via.placeholder.com/100/BB8FCE/fff?text=Bear', leftText: '🐻', rightText: 'Bear' },
      { id: 6, leftImage: 'https://via.placeholder.com/100/85C1E2/fff?text=🐼', rightImage: 'https://via.placeholder.com/100/85C1E2/fff?text=Panda', leftText: '🐼', rightText: 'Panda' },
      { id: 7, leftImage: 'https://via.placeholder.com/100/F8B88B/000?text=🦊', rightImage: 'https://via.placeholder.com/100/F8B88B/000?text=Fox', leftText: '🦊', rightText: 'Fox' }
    ]
  }

  const handleStart = () => {
    setStarted(true)
    audioManager.playClick()
  }

  const handleComplete = (score: number) => {
    console.log('Completed with score:', score)
  }

  if (started) {
    return (
      <div className="play-matching-page">
        <div className="matching-game-header">
          <h1>🎯 เกมโยงเส้นจับคู่</h1>
          <button className="back-btn" onClick={() => setStarted(false)}>
            ← เริ่มใหม่
          </button>
        </div>
        <MatchingBoard
          pairs={storedPairs.length > 0 ? storedPairs : samplePairs[difficulty]}
          onComplete={handleComplete}
        />
      </div>
    )
  }

  return (
    <div className="matching-setup">
      <div className="setup-header">
        <h1>🎯 เกมโยงเส้นจับคู่</h1>
        <button className="back-btn" onClick={() => window.history.back()}>
          ← กลับ
        </button>
      </div>

      <div className="setup-container">
        {storedPairs.length > 0 && (
          <div className="info-banner">
            ✅ พบ {storedPairs.length} คู่จากระบบครู
          </div>
        )}
        <div className="setup-card">
          <h2>เลือกระดับความยาก</h2>
          <div className="difficulty-buttons">
            <button
              className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
              onClick={() => { setDifficulty('easy'); audioManager.playClick(); }}
            >
              <div className="difficulty-icon">😊</div>
              <div className="difficulty-name">ง่าย</div>
              <div className="difficulty-desc">3 คู่</div>
            </button>
            
            <button
              className={`difficulty-btn ${difficulty === 'medium' ? 'active' : ''}`}
              onClick={() => { setDifficulty('medium'); audioManager.playClick(); }}
            >
              <div className="difficulty-icon">🤔</div>
              <div className="difficulty-name">ปานกลาง</div>
              <div className="difficulty-desc">5 คู่</div>
            </button>
            
            <button
              className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`}
              onClick={() => { setDifficulty('hard'); audioManager.playClick(); }}
            >
              <div className="difficulty-icon">🤯</div>
              <div className="difficulty-name">ยาก</div>
              <div className="difficulty-desc">7 คู่</div>
            </button>
          </div>
        </div>

        <button className="start-btn" onClick={handleStart}>
          🎮 เริ่มเล่น!
        </button>
      </div>
    </div>
  )
}

export default PlayMatching
