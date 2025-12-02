import { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import PuzzleBoard from '../../components/PuzzleBoard'
import { audioManager } from '../../utils/audio'
import { getPuzzleConfigs } from '../../services/storage'
import './PlayPuzzle.css'

// Detect touch device
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

function PlayPuzzle() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [started, setStarted] = useState(false)
  const [puzzleConfigs, setPuzzleConfigs] = useState<any[]>([])
  const [selectedConfig, setSelectedConfig] = useState<string>('')

  useEffect(() => {
    const configs = getPuzzleConfigs()
    setPuzzleConfigs(configs)
  }, [])

  const handleDifficultySelect = (level: 'easy' | 'medium' | 'hard') => {
    setDifficulty(level)
    audioManager.playClick()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConfigSelect = (configId: string) => {
    const config = puzzleConfigs.find(c => c.id === configId)
    if (config) {
      setSelectedConfig(configId)
      setImageUrl(config.imageUrl)
      setDifficulty(config.difficulty)
      audioManager.playClick()
    }
  }

  const handleStart = () => {
    if (!imageUrl) {
      // Use default image if none uploaded
      setImageUrl('https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&h=400&fit=crop')
    }
    setStarted(true)
    audioManager.playClick()
  }

  if (started && imageUrl) {
    return (
      <DndProvider backend={isTouchDevice ? TouchBackend : HTML5Backend}>
        <div className="puzzle-page">
          <div className="puzzle-header">
            <h1>🧩 จิ๊กซอว์</h1>
            <button className="back-btn" onClick={() => setStarted(false)}>
              ← เริ่มใหม่
            </button>
          </div>
          <PuzzleBoard imageUrl={imageUrl} difficulty={difficulty} />
        </div>
      </DndProvider>
    )
  }

  return (
    <div className="puzzle-setup">
      <div className="setup-header">
        <h1>🧩 เกมจิ๊กซอว์</h1>
        <button className="back-btn" onClick={() => window.history.back()}>
          ← กลับ
        </button>
      </div>

      <div className="setup-container">
        {puzzleConfigs.length > 0 && (
          <div className="setup-card">
            <h2>📦 เลือกชุดจิ๊กซอว์จากครู</h2>
            <div className="config-list">
              {puzzleConfigs.map(config => (
                <div 
                  key={config.id} 
                  className={`config-item ${selectedConfig === config.id ? 'selected' : ''}`}
                  onClick={() => handleConfigSelect(config.id)}
                >
                  <img src={config.imageUrl} alt={config.name} />
                  <div className="config-info">
                    <h3>{config.name}</h3>
                    <span className="difficulty-badge">{config.difficulty === 'easy' ? 'ง่าย' : config.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="divider">หรือ</div>
          </div>
        )}
        
        <div className="setup-card">
          <h2>1. เลือกรูปภาพ</h2>
          <div className="upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              id="puzzle-upload"
              className="file-input-hidden"
            />
            <label htmlFor="puzzle-upload" className="upload-label">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="preview-image" />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📸</span>
                  <p>คลิกเพื่ออัปโหลดรูป</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="setup-card">
          <h2>2. เลือกระดับความยาก</h2>
          <div className="difficulty-buttons">
            <button
              className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
              onClick={() => handleDifficultySelect('easy')}
            >
              <div className="difficulty-icon">😊</div>
              <div className="difficulty-name">ง่าย</div>
              <div className="difficulty-desc">9 ชิ้น (3×3)</div>
            </button>
            
            <button
              className={`difficulty-btn ${difficulty === 'medium' ? 'active' : ''}`}
              onClick={() => handleDifficultySelect('medium')}
            >
              <div className="difficulty-icon">🤔</div>
              <div className="difficulty-name">ปานกลาง</div>
              <div className="difficulty-desc">16 ชิ้น (4×4)</div>
            </button>
            
            <button
              className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`}
              onClick={() => handleDifficultySelect('hard')}
            >
              <div className="difficulty-icon">🤯</div>
              <div className="difficulty-name">ยาก</div>
              <div className="difficulty-desc">25 ชิ้น (5×5)</div>
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

export default PlayPuzzle
