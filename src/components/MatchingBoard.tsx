import { useState, useRef, useEffect, Fragment } from 'react'
import { Stage, Layer, Line, Image as KonvaImage, Rect, Text } from 'react-konva'
import { audioManager } from '../utils/audio'
import './MatchingBoard.css'

interface MatchPair {
  id: number
  leftImage: string
  rightImage: string
  leftText?: string
  rightText?: string
}

interface DrawnLine {
  id: number
  points: number[]
  fromId: number
  toId: number
  isCorrect: boolean
  color: string
}

interface MatchingBoardProps {
  pairs: MatchPair[]
  onComplete?: (score: number) => void
}

function MatchingBoard({ pairs, onComplete }: MatchingBoardProps) {
  const [images, setImages] = useState<Map<string, HTMLImageElement>>(new Map())
  const [lines, setLines] = useState<DrawnLine[]>([])
  const [currentLine, setCurrentLine] = useState<number[] | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set())
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ id: number; x: number; y: number } | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const stageRef = useRef<any>(null)

  const STAGE_WIDTH = 1000
  const STAGE_HEIGHT = 600
  const ITEM_SIZE = 100
  const LEFT_X = 100
  const RIGHT_X = 800

  useEffect(() => {
    // Load all images
    const loadImages = async () => {
      const imageMap = new Map<string, HTMLImageElement>()
      
      for (const pair of pairs) {
        if (pair.leftImage) {
          const img = new Image()
          img.src = pair.leftImage
          await new Promise((resolve) => { img.onload = resolve })
          imageMap.set(`left-${pair.id}`, img)
        }
        if (pair.rightImage) {
          const img = new Image()
          img.src = pair.rightImage
          await new Promise((resolve) => { img.onload = resolve })
          imageMap.set(`right-${pair.id}`, img)
        }
      }
      
      setImages(imageMap)
    }
    
    loadImages()
  }, [pairs])

  useEffect(() => {
    if (matchedPairs.size === pairs.length && pairs.length > 0) {
      setShowSuccess(true)
      audioManager.playSuccess()
      setTimeout(() => {
        onComplete?.(100)
      }, 2000)
    }
  }, [matchedPairs, pairs.length])

  const handleReset = () => {
    setLines([])
    setMatchedPairs(new Set())
    setShowSuccess(false)
    setCurrentLine(null)
    setStartPoint(null)
    setIsDrawing(false)
  }

  const getItemPosition = (index: number, isLeft: boolean) => {
    const spacing = (STAGE_HEIGHT - 100) / Math.max(pairs.length, 1)
    const y = 50 + index * spacing
    const x = isLeft ? LEFT_X : RIGHT_X
    return { x, y }
  }

  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    
    // Check if click is on a left item
    pairs.forEach((pair, index) => {
      const leftPos = getItemPosition(index, true)
      const distance = Math.sqrt(
        Math.pow(pos.x - (leftPos.x + ITEM_SIZE / 2), 2) + 
        Math.pow(pos.y - (leftPos.y + ITEM_SIZE / 2), 2)
      )
      
      if (distance < ITEM_SIZE / 2 && !matchedPairs.has(pair.id)) {
        setIsDrawing(true)
        setStartPoint({ id: pair.id, x: leftPos.x + ITEM_SIZE / 2, y: leftPos.y + ITEM_SIZE / 2 })
        setCurrentLine([leftPos.x + ITEM_SIZE / 2, leftPos.y + ITEM_SIZE / 2])
        audioManager.playClick()
      }
    })
  }

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !currentLine) return

    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    
    setCurrentLine([...currentLine, pos.x, pos.y])
  }

  const handleMouseUp = (e: any) => {
    if (!isDrawing || !startPoint || !currentLine) return

    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()

    // Check if endpoint is on a right item
    let matched = false
    pairs.forEach((pair, index) => {
      const rightPos = getItemPosition(index, false)
      const distance = Math.sqrt(
        Math.pow(pos.x - (rightPos.x + ITEM_SIZE / 2), 2) + 
        Math.pow(pos.y - (rightPos.y + ITEM_SIZE / 2), 2)
      )
      
      if (distance < ITEM_SIZE / 2 && !matchedPairs.has(pair.id)) {
        const isCorrect = pair.id === startPoint.id
        
        if (isCorrect) {
          // Correct match
          const newLine: DrawnLine = {
            id: Date.now(),
            points: currentLine,
            fromId: startPoint.id,
            toId: pair.id,
            isCorrect: true,
            color: '#22c55e'
          }
          setLines([...lines, newLine])
          setMatchedPairs(new Set([...matchedPairs, pair.id]))
          audioManager.playCorrect()
          matched = true
        } else {
          // Wrong match
          audioManager.playFail()
          // Show red line briefly then remove
          const errorLine: DrawnLine = {
            id: Date.now(),
            points: currentLine,
            fromId: startPoint.id,
            toId: pair.id,
            isCorrect: false,
            color: '#ef4444'
          }
          setLines([...lines, errorLine])
          setTimeout(() => {
            setLines(prev => prev.filter(l => l.id !== errorLine.id))
          }, 500)
          matched = true
        }
      }
    })

    if (!matched) {
      audioManager.playClick()
    }

    setIsDrawing(false)
    setCurrentLine(null)
    setStartPoint(null)
  }

  return (
    <div className="matching-board-container">
      <div className="matching-header">
        <h2>🎯 โยงเส้นจับคู่</h2>
        <div className="score-display">
          คะแนน: {matchedPairs.size} / {pairs.length}
        </div>
      </div>

      <div className="canvas-container">
        <Stage
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {/* Draw completed lines */}
            {lines.map(line => (
              <Line
                key={line.id}
                points={line.points}
                stroke={line.color}
                strokeWidth={4}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            ))}

            {/* Draw current line being drawn */}
            {currentLine && (
              <Line
                points={currentLine}
                stroke="#3b82f6"
                strokeWidth={4}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                dash={[10, 5]}
              />
            )}

            {/* Draw left items */}
            {pairs.map((pair, index) => {
              const pos = getItemPosition(index, true)
              const isMatched = matchedPairs.has(pair.id)
              
              return (
                <Fragment key={`left-${pair.id}`}>
                  <Rect
                    x={pos.x}
                    y={pos.y}
                    width={ITEM_SIZE}
                    height={ITEM_SIZE}
                    fill={isMatched ? '#86efac' : '#ffffff'}
                    stroke={isMatched ? '#22c55e' : '#cbd5e1'}
                    strokeWidth={3}
                    cornerRadius={12}
                    shadowBlur={isMatched ? 0 : 5}
                    shadowColor="rgba(0,0,0,0.2)"
                  />
                  {images.get(`left-${pair.id}`) && (
                    <KonvaImage
                      x={pos.x + 10}
                      y={pos.y + 10}
                      width={ITEM_SIZE - 20}
                      height={ITEM_SIZE - 20}
                      image={images.get(`left-${pair.id}`)}
                    />
                  )}
                  {pair.leftText && (
                    <Text
                      x={pos.x}
                      y={pos.y + ITEM_SIZE + 10}
                      width={ITEM_SIZE}
                      text={pair.leftText}
                      fontSize={14}
                      fontFamily="Noto Sans Thai"
                      align="center"
                      fill="#333"
                    />
                  )}
                </Fragment>
              )
            })}

            {/* Draw right items */}
            {pairs.map((pair, index) => {
              const pos = getItemPosition(index, false)
              const isMatched = matchedPairs.has(pair.id)
              
              return (
                <Fragment key={`right-${pair.id}`}>
                  <Rect
                    x={pos.x}
                    y={pos.y}
                    width={ITEM_SIZE}
                    height={ITEM_SIZE}
                    fill={isMatched ? '#86efac' : '#ffffff'}
                    stroke={isMatched ? '#22c55e' : '#cbd5e1'}
                    strokeWidth={3}
                    cornerRadius={12}
                    shadowBlur={isMatched ? 0 : 5}
                    shadowColor="rgba(0,0,0,0.2)"
                  />
                  {images.get(`right-${pair.id}`) && (
                    <KonvaImage
                      x={pos.x + 10}
                      y={pos.y + 10}
                      width={ITEM_SIZE - 20}
                      height={ITEM_SIZE - 20}
                      image={images.get(`right-${pair.id}`)}
                    />
                  )}
                  {pair.rightText && (
                    <Text
                      x={pos.x}
                      y={pos.y + ITEM_SIZE + 10}
                      width={ITEM_SIZE}
                      text={pair.rightText}
                      fontSize={14}
                      fontFamily="Noto Sans Thai"
                      align="center"
                      fill="#333"
                    />
                  )}
                </Fragment>
              )
            })}
          </Layer>
        </Stage>
      </div>

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-message bounce">
            <div className="success-icon">🎉</div>
            <h2>เก่งมาก!</h2>
            <p>จับคู่ได้ถูกต้องทั้งหมด! 🌟</p>
            <button className="play-again-btn" onClick={handleReset}>
              🎮 เล่นอีกครั้ง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchingBoard
