import { useState, useEffect, useRef, Fragment } from 'react'
import { Stage, Layer, Circle, Rect, Text } from 'react-konva'
import { audioManager } from '../utils/audio'
import './FloatingBeadsBoard.css'

interface Bead {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  radius: number
  sequenceOrder?: number
  basketId?: string
  isActive: boolean
  isTapped?: boolean
}

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

interface FloatingBeadsBoardProps {
  mode: 'sequence' | 'basket'
  beadCount?: number
  sequence?: number[]
  baskets?: Basket[]
  onComplete?: (score: number) => void
}

const BEAD_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899']

function FloatingBeadsBoard({ mode, beadCount = 6, sequence = [], baskets = [], onComplete }: FloatingBeadsBoardProps) {
  const [beads, setBeads] = useState<Bead[]>([])
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [draggedBead, setDraggedBead] = useState<number | null>(null)
  const animationRef = useRef<number>()
  const stageRef = useRef<any>(null)

  const STAGE_WIDTH = 1000
  const STAGE_HEIGHT = 600
  const BEAD_RADIUS = 30

  useEffect(() => {
    initializeBeads()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [mode, beadCount])

  useEffect(() => {
    animate()
  }, [beads])

  const initializeBeads = () => {
    const newBeads: Bead[] = []
    
    for (let i = 0; i < beadCount; i++) {
      const bead: Bead = {
        id: i,
        x: Math.random() * (STAGE_WIDTH - 100) + 50,
        y: Math.random() * (STAGE_HEIGHT - 200) + 50,
        vx: 0,
        vy: 0,
        color: BEAD_COLORS[i % BEAD_COLORS.length],
        radius: BEAD_RADIUS,
        isActive: true,
        isTapped: false
      }

      if (mode === 'sequence' && sequence.length > 0) {
        bead.sequenceOrder = sequence[i] || i
      }

      if (mode === 'basket' && baskets.length > 0) {
        bead.basketId = baskets[i % baskets.length].id
      }

      newBeads.push(bead)
    }

    setBeads(newBeads)
  }

  const handleReset = () => {
    setShowSuccess(false)
    setScore(0)
    setCurrentSequenceIndex(0)
    initializeBeads()
  }

  const animate = () => {
    setBeads(prevBeads => {
      return prevBeads.map(bead => {
        if (!bead.isActive || bead.isTapped || draggedBead === bead.id) return bead

        let newX = bead.x + bead.vx
        let newY = bead.y + bead.vy
        let newVx = bead.vx
        let newVy = bead.vy

        // Bounce off walls
        if (newX - bead.radius < 0 || newX + bead.radius > STAGE_WIDTH) {
          newVx = -newVx
          newX = Math.max(bead.radius, Math.min(STAGE_WIDTH - bead.radius, newX))
        }

        if (newY - bead.radius < 0 || newY + bead.radius > STAGE_HEIGHT - 100) {
          newVy = -newVy
          newY = Math.max(bead.radius, Math.min(STAGE_HEIGHT - 100 - bead.radius, newY))
        }

        return { ...bead, x: newX, y: newY, vx: newVx, vy: newVy }
      })
    })

    animationRef.current = requestAnimationFrame(animate)
  }

  const handleBeadTap = (beadId: number) => {
    if (mode !== 'sequence') return

    const bead = beads.find(b => b.id === beadId)
    if (!bead || bead.isTapped) return

    const expectedId = sequence[currentSequenceIndex]

    if (beadId === expectedId) {
      // Correct tap
      setBeads(prev => prev.map(b => 
        b.id === beadId ? { ...b, isTapped: true } : b
      ))
      setCurrentSequenceIndex(prev => prev + 1)
      setScore(prev => prev + 10)
      audioManager.playCorrect()

      // Check if completed
      if (currentSequenceIndex + 1 === sequence.length) {
        setTimeout(() => {
          setShowSuccess(true)
          audioManager.playSuccess()
          onComplete?.(score + 10)
        }, 500)
      }
    } else {
      // Wrong tap - shake effect
      audioManager.playFail()
      const beadElement = document.getElementById(`bead-${beadId}`)
      beadElement?.classList.add('shake')
      setTimeout(() => {
        beadElement?.classList.remove('shake')
      }, 500)
    }
  }

  const handleDragStart = (beadId: number) => {
    if (mode !== 'basket') return
    setDraggedBead(beadId)
    audioManager.playClick()
  }

  const handleDragEnd = (beadId: number, e: any) => {
    if (mode !== 'basket') return

    const pos = e.target.getStage().getPointerPosition()
    const bead = beads.find(b => b.id === beadId)

    if (!bead) return

    // Check if dropped in correct basket
    baskets.forEach(basket => {
      if (
        pos.x >= basket.x &&
        pos.x <= basket.x + basket.width &&
        pos.y >= basket.y &&
        pos.y <= basket.y + basket.height
      ) {
        // Check if color matches
        if (basket.acceptedColors.includes(bead.color)) {
          setBeads(prev => prev.filter(b => b.id !== beadId))
          setScore(prev => prev + 10)
          audioManager.playCorrect()

          // Check if all beads collected
          if (beads.filter(b => b.isActive).length === 1) {
            setTimeout(() => {
              setShowSuccess(true)
              audioManager.playSuccess()
              onComplete?.(score + 10)
            }, 500)
          }
        } else {
          audioManager.playFail()
        }
      }
    })

    setDraggedBead(null)
  }

  return (
    <div className="floating-beads-container">
      <div className="beads-header">
        <h2>{mode === 'sequence' ? '🎯 แตะตามลำดับ' : '🧺 ลากใส่ตะกร้า'}</h2>
        <div className="score-display">
          {mode === 'sequence' && `${currentSequenceIndex} / ${sequence.length}`}
          {mode === 'basket' && `คะแนน: ${score}`}
        </div>
      </div>

      <div className="canvas-container">
        <Stage
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          ref={stageRef}
        >
          <Layer>
            {/* Draw baskets if in basket mode */}
            {mode === 'basket' && baskets.map(basket => (
              <Fragment key={basket.id}>
                <Rect
                  x={basket.x}
                  y={basket.y}
                  width={basket.width}
                  height={basket.height}
                  fill={basket.color}
                  stroke="#64748b"
                  strokeWidth={3}
                  cornerRadius={12}
                  opacity={0.3}
                />
                <Text
                  x={basket.x}
                  y={basket.y + basket.height / 2 - 10}
                  width={basket.width}
                  text={basket.label}
                  fontSize={20}
                  fontFamily="Noto Sans Thai"
                  fontStyle="bold"
                  align="center"
                  fill="#1e293b"
                />
              </Fragment>
            ))}

            {/* Draw beads */}
            {beads.map(bead => (
              <Circle
                key={bead.id}
                id={`bead-${bead.id}`}
                x={bead.x}
                y={bead.y}
                radius={bead.radius}
                fill={bead.color}
                stroke={bead.isTapped ? '#22c55e' : '#fff'}
                strokeWidth={bead.isTapped ? 4 : 2}
                shadowBlur={10}
                shadowColor="rgba(0,0,0,0.3)"
                opacity={bead.isTapped ? 0.5 : 1}
                draggable={mode === 'basket' && !bead.isTapped}
                onDragStart={() => handleDragStart(bead.id)}
                onDragEnd={(e) => handleDragEnd(bead.id, e)}
                onClick={() => handleBeadTap(bead.id)}
                onTap={() => handleBeadTap(bead.id)}
              />
            ))}

            {/* Show sequence numbers */}
            {mode === 'sequence' && beads.map(bead => {
              if (bead.sequenceOrder === undefined) return null
              return (
                <Text
                  key={`num-${bead.id}`}
                  x={bead.x - 10}
                  y={bead.y - 10}
                  text={String(bead.sequenceOrder + 1)}
                  fontSize={20}
                  fontFamily="Noto Sans Thai"
                  fontStyle="bold"
                  fill="#fff"
                />
              )
            })}
          </Layer>
        </Stage>
      </div>

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-message bounce">
            <div className="success-icon">🎊</div>
            <h2>ยอดเยี่ยม!</h2>
            <p>คุณทำได้สำเร็จ! 🌟</p>
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

export default FloatingBeadsBoard
