import { useState, useRef, useEffect } from 'react'
import { audioManager } from '../utils/audio'
import './ShadowMatchingBoard.css'

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

interface ShadowMatchingBoardProps {
  items: ShadowItem[]
  onComplete?: (score: number) => void
}

function ShadowMatchingBoard({ items, onComplete }: ShadowMatchingBoardProps) {
  const [gameItems, setGameItems] = useState<ShadowItem[]>(items)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [showSuccess, setShowSuccess] = useState(false)
  const [score, setScore] = useState(0)
  const boardRef = useRef<HTMLDivElement>(null)

  const ITEM_SIZE = 120
  const SNAP_THRESHOLD = 60

  useEffect(() => {
    const matched = gameItems.filter(item => item.placed).length
    const totalScore = matched * 10
    setScore(totalScore)

    if (matched === gameItems.length && gameItems.length > 0) {
      setTimeout(() => {
        setShowSuccess(true)
        audioManager.playSuccess()
        onComplete?.(totalScore)
      }, 300)
    }
  }, [gameItems])

  const handlePointerDown = (e: React.PointerEvent, itemId: string) => {
    const item = gameItems.find(i => i.id === itemId)
    if (!item || item.placed) return

    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const boardRect = boardRef.current?.getBoundingClientRect()
    
    if (!boardRect) return

    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    setDraggedItem(itemId)
    setIsDragging(true)
    setOffset({ x: offsetX, y: offsetY })
    setDragPosition({ 
      x: e.clientX - boardRect.left - offsetX, 
      y: e.clientY - boardRect.top - offsetY 
    })

    audioManager.playClick()
    
    // Capture pointer for better touch handling
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !draggedItem) return

    const boardRect = boardRef.current?.getBoundingClientRect()
    if (!boardRect) return

    setDragPosition({ 
      x: e.clientX - boardRect.left - offset.x, 
      y: e.clientY - boardRect.top - offset.y 
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !draggedItem) return

    const item = gameItems.find(i => i.id === draggedItem)
    if (!item) return

    const boardRect = boardRef.current?.getBoundingClientRect()
    if (!boardRect) return

    const dropX = e.clientX - boardRect.left
    const dropY = e.clientY - boardRect.top

    // Check if dropped on correct shadow
    const distance = Math.sqrt(
      Math.pow(dropX - (item.shadowX + ITEM_SIZE / 2), 2) + 
      Math.pow(dropY - (item.shadowY + ITEM_SIZE / 2), 2)
    )

    if (distance < SNAP_THRESHOLD) {
      // Correct placement
      setGameItems(prev => prev.map(i => 
        i.id === draggedItem 
          ? { ...i, placed: true }
          : i
      ))
      audioManager.playCorrect()
    } else {
      // Wrong placement - shake and return
      const element = document.getElementById(`real-${draggedItem}`)
      element?.classList.add('shake')
      audioManager.playFail()
      
      setTimeout(() => {
        element?.classList.remove('shake')
      }, 500)
    }

    setIsDragging(false)
    setDraggedItem(null)
    
    // Release pointer capture
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  const handleReset = () => {
    setGameItems(items.map(item => ({ ...item, placed: false })))
    setShowSuccess(false)
    setScore(0)
    audioManager.playClick()
  }

  return (
    <div className="shadow-matching-container">
      <div className="shadow-header">
        <h2>🌙 ลากเงาให้ตรง</h2>
        <div className="score-display">คะแนน: {score}</div>
      </div>

      <div 
        className="shadow-board"
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Shadow slots (targets) */}
        {gameItems.map(item => (
          <div
            key={`shadow-${item.id}`}
            className={`shadow-slot ${item.placed ? 'filled' : ''}`}
            style={{
              left: item.shadowX,
              top: item.shadowY,
              width: ITEM_SIZE,
              height: ITEM_SIZE
            }}
          >
            <img 
              src={item.shadowImage} 
              alt="shadow"
              className="shadow-image"
              draggable={false}
            />
            {item.placed && (
              <div className="checkmark">✓</div>
            )}
          </div>
        ))}

        {/* Real images (draggable) */}
        {gameItems.map(item => {
          const isDragged = draggedItem === item.id
          const style: React.CSSProperties = item.placed
            ? {
                left: item.shadowX,
                top: item.shadowY,
                width: ITEM_SIZE,
                height: ITEM_SIZE
              }
            : isDragged
            ? {
                left: dragPosition.x,
                top: dragPosition.y,
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                cursor: 'grabbing',
                zIndex: 1000
              }
            : {
                left: item.realX,
                top: item.realY,
                width: ITEM_SIZE,
                height: ITEM_SIZE
              }

          return (
            <div
              key={`real-${item.id}`}
              id={`real-${item.id}`}
              className={`real-image ${item.placed ? 'placed' : ''} ${isDragged ? 'dragging' : ''}`}
              style={style}
              onPointerDown={(e) => handlePointerDown(e, item.id)}
              touch-action="none"
            >
              <img 
                src={item.realImage} 
                alt="real"
                draggable={false}
              />
            </div>
          )
        })}
      </div>

      <div className="shadow-controls">
        <button className="reset-btn" onClick={handleReset}>
          🔄 เริ่มใหม่
        </button>
      </div>

      {/* Mascot helper */}
      <div className="mascot-helper">
        <div className="mascot-avatar">🦊</div>
        <div className="mascot-speech">
          {gameItems.filter(i => i.placed).length === 0 && "ลากรูปไปวางบนเงา!"}
          {gameItems.filter(i => i.placed).length > 0 && gameItems.filter(i => i.placed).length < gameItems.length && "เก่งมาก! ทำต่อไป!"}
          {gameItems.filter(i => i.placed).length === gameItems.length && "เยี่ยม! 🌟"}
        </div>
      </div>

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-message bounce">
            <div className="success-icon">🎉</div>
            <h2>สำเร็จ!</h2>
            <p>จับคู่เงาได้ถูกต้องทั้งหมด! 🌟</p>
            <p className="final-score">คะแนน: {score}</p>
            <button className="play-again-btn" onClick={handleReset}>
              🎮 เล่นอีกครั้ง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShadowMatchingBoard
