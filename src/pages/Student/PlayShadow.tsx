import { useState } from 'react'
import ShadowMatchingBoard from '../../components/ShadowMatchingBoard'
import { audioManager } from '../../utils/audio'
import './PlayShadow.css'

interface ShadowItem {
  id: string
  realImage: string
  shadowImage: string
  realX: number
  realY: number
  shadowX: number
  shadowY: number
  placed: boolean
}

function PlayShadow() {
  const [started, setStarted] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')

  // Sample data - ในการใช้งานจริงจะมาจาก API หรือ Teacher setup
  const generateItems = (count: number): ShadowItem[] => {
    const items: ShadowItem[] = []
    const emojis = ['🍎', '🍌', '🍇', '🍊', '🍓', '🥝', '🍑', '🍒', '🥭']
    const leftX = 50
    const rightX = 650
    const spacing = 100
    const startY = 50

    for (let i = 0; i < count; i++) {
      items.push({
        id: `item-${i}`,
        realImage: `https://via.placeholder.com/120/${['FF6B6B', '4ECDC4', '45B7D1', 'F7DC6F', 'BB8FCE', '85C1E2', 'F8B88B', 'A569BD', '52BE80'][i]}/fff?text=${emojis[i]}`,
        shadowImage: `https://via.placeholder.com/120/505050/505050?text=${emojis[i]}`,
        realX: leftX,
        realY: startY + (i * spacing),
        shadowX: rightX,
        shadowY: startY + (i * spacing),
        placed: false
      })
    }

    // Shuffle shadow positions
    const shuffledY = items.map(item => item.shadowY).sort(() => Math.random() - 0.5)
    items.forEach((item, index) => {
      item.shadowY = shuffledY[index]
    })

    return items
  }

  const getDifficultyCount = () => {
    switch (difficulty) {
      case 'easy': return 3
      case 'medium': return 5
      case 'hard': return 7
      default: return 3
    }
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
      <div className="play-shadow-page">
        <div className="shadow-game-header">
          <h1>🌙 ลากเงาให้ตรง</h1>
          <button className="back-btn" onClick={() => setStarted(false)}>
            ← เริ่มใหม่
          </button>
        </div>
        <ShadowMatchingBoard
          items={generateItems(getDifficultyCount())}
          onComplete={handleComplete}
        />
      </div>
    )
  }

  return (
    <div className="shadow-setup">
      <div className="setup-header">
        <h1>🌙 เกมลากเงาให้ตรง</h1>
        <button className="back-btn" onClick={() => window.history.back()}>
          ← กลับ
        </button>
      </div>

      <div className="setup-container">
        <div className="setup-card">
          <h2>วิธีเล่น</h2>
          <div className="instructions">
            <div className="instruction-item">
              <span className="step-number">1</span>
              <p>ลากรูปจริงฝั่งซ้าย</p>
            </div>
            <div className="instruction-item">
              <span className="step-number">2</span>
              <p>วางทับเงาที่ตรงกัน</p>
            </div>
            <div className="instruction-item">
              <span className="step-number">3</span>
              <p>จับคู่ให้ครบทุกคู่!</p>
            </div>
          </div>
        </div>

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

        <div className="demo-preview">
          <h3>ตัวอย่าง</h3>
          <div className="demo-container">
            <div className="demo-item">
              <div className="demo-real">🍎</div>
              <div className="demo-arrow">→</div>
              <div className="demo-shadow">🍎</div>
            </div>
            <p className="demo-text">ลากรูปจริงไปวางบนเงา</p>
          </div>
        </div>

        <button className="start-btn" onClick={handleStart}>
          🎮 เริ่มเล่น!
        </button>
      </div>
    </div>
  )
}

export default PlayShadow
