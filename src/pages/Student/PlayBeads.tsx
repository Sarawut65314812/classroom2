import { useState } from 'react'
import FloatingBeadsBoard from '../../components/FloatingBeadsBoard'
import { audioManager } from '../../utils/audio'
import './PlayBeads.css'

interface Basket {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  label: string
  acceptedColors: string[]
}

function PlayBeads() {
  const [started, setStarted] = useState(false)
  const [mode, setMode] = useState<'sequence' | 'basket'>('sequence')
  const [beadCount, setBeadCount] = useState(6)

  // Sample sequence for demo
  const sampleSequence = [0, 1, 2, 3, 4, 5]

  // Sample baskets for demo
  const sampleBaskets: Basket[] = [
    {
      id: 'red',
      x: 100,
      y: 450,
      width: 150,
      height: 100,
      color: '#ef4444',
      label: '🔴 แดง',
      acceptedColors: ['#ef4444']
    },
    {
      id: 'blue',
      x: 300,
      y: 450,
      width: 150,
      height: 100,
      color: '#3b82f6',
      label: '🔵 น้ำเงิน',
      acceptedColors: ['#3b82f6']
    },
    {
      id: 'green',
      x: 500,
      y: 450,
      width: 150,
      height: 100,
      color: '#22c55e',
      label: '🟢 เขียว',
      acceptedColors: ['#22c55e']
    },
    {
      id: 'yellow',
      x: 700,
      y: 450,
      width: 150,
      height: 100,
      color: '#f59e0b',
      label: '🟡 เหลือง',
      acceptedColors: ['#f59e0b']
    }
  ]

  const handleStart = () => {
    setStarted(true)
    audioManager.playClick()
  }

  const handleComplete = (score: number) => {
    console.log('Completed with score:', score)
  }

  if (started) {
    return (
      <div className="play-beads-page">
        <div className="beads-game-header">
          <h1>{mode === 'sequence' ? '🎯 แตะตามลำดับ' : '🧺 ลากใส่ตะกร้า'}</h1>
          <button className="back-btn" onClick={() => setStarted(false)}>
            ← เริ่มใหม่
          </button>
        </div>
        <FloatingBeadsBoard
          mode={mode}
          beadCount={beadCount}
          sequence={mode === 'sequence' ? sampleSequence : []}
          baskets={mode === 'basket' ? sampleBaskets : []}
          onComplete={handleComplete}
        />
      </div>
    )
  }

  return (
    <div className="beads-setup">
      <div className="setup-header">
        <h1>🎮 เกมลูกปัดลอย</h1>
        <button className="back-btn" onClick={() => window.history.back()}>
          ← กลับ
        </button>
      </div>

      <div className="setup-container">
        <div className="setup-card">
          <h2>เลือกโหมดเกม</h2>
          <div className="mode-buttons">
            <button
              className={`mode-btn ${mode === 'sequence' ? 'active' : ''}`}
              onClick={() => { setMode('sequence'); audioManager.playClick(); }}
            >
              <div className="mode-icon">🎯</div>
              <div className="mode-name">แตะตามลำดับ</div>
              <div className="mode-desc">แตะลูกปัดตามหมายเลข</div>
            </button>
            
            <button
              className={`mode-btn ${mode === 'basket' ? 'active' : ''}`}
              onClick={() => { setMode('basket'); audioManager.playClick(); }}
            >
              <div className="mode-icon">🧺</div>
              <div className="mode-name">ลากใส่ตะกร้า</div>
              <div className="mode-desc">ลากลูกปัดเข้าตะกร้าที่ถูกสี</div>
            </button>
          </div>
        </div>

        <div className="setup-card">
          <h2>จำนวนลูกปัด: {beadCount}</h2>
          <input
            type="range"
            min="3"
            max="10"
            value={beadCount}
            onChange={(e) => setBeadCount(Number(e.target.value))}
            className="bead-slider"
          />
          <div className="slider-labels">
            <span>3</span>
            <span>10</span>
          </div>
        </div>

        <button className="start-btn" onClick={handleStart}>
          🎮 เริ่มเล่น!
        </button>
      </div>
    </div>
  )
}

export default PlayBeads
