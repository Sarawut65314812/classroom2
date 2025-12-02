import { useState, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { audioManager } from '../utils/audio'
import './PuzzleBoard.css'

interface PuzzlePiece {
  id: number
  correctPosition: number
  currentPosition: number // ตำแหน่งปัจจุบันในกระดาน (0-8) หรือ -1 ถ้าอยู่ในพื้นที่ชิ้นส่วน
  imageData: string
}

interface PuzzleBoardProps {
  imageUrl: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const GRID_SIZE = {
  easy: 3,
  medium: 4,
  hard: 5
}

function PuzzleBoard({ imageUrl, difficulty }: PuzzleBoardProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [showHint, setShowHint] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const gridSize = GRID_SIZE[difficulty]

  useEffect(() => {
    sliceImage()
  }, [imageUrl, difficulty])

  const sliceImage = async () => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      // คำนวณขนาดที่เป็นสี่เหลี่ยมจัตุรัส
      const size = Math.min(img.width, img.height)
      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2
      
      const pieceWidth = size / gridSize
      const pieceHeight = size / gridSize
      
      const newPieces: PuzzlePiece[] = []
      
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          canvas.width = pieceWidth
          canvas.height = pieceHeight
          
          // วาดชิ้นส่วนจากตรงกลางรูป (crop แบบสี่เหลี่ยมจัตุรัส)
          ctx.drawImage(
            img,
            offsetX + col * pieceWidth,
            offsetY + row * pieceHeight,
            pieceWidth,
            pieceHeight,
            0,
            0,
            pieceWidth,
            pieceHeight
          )
          
          const position = row * gridSize + col
          newPieces.push({
            id: position,
            correctPosition: position,
            currentPosition: -1, // เริ่มต้นอยู่ในพื้นที่ชิ้นส่วน
            imageData: canvas.toDataURL()
          })
        }
      }
      
      // Shuffle pieces
      const shuffled = [...newPieces].sort(() => Math.random() - 0.5)
      
      setPieces(shuffled)
      setIsComplete(false)
    }
  }

  // ย้ายชิ้นส่วนจากที่หนึ่งไปยังอีกที่หนึ่ง
  const movePiece = (pieceId: number, toPosition: number) => {
    setPieces(prevPieces => {
      const newPieces = [...prevPieces]
      const pieceIndex = newPieces.findIndex(p => p.id === pieceId)
      if (pieceIndex === -1) return prevPieces

      const piece = newPieces[pieceIndex]
      const fromPosition = piece.currentPosition

      // ตรวจสอบว่ามีชิ้นอื่นอยู่ที่ตำแหน่งปลายทางหรือไม่
      const targetPieceIndex = newPieces.findIndex(p => p.currentPosition === toPosition)

      if (targetPieceIndex !== -1) {
        // มีชิ้นอยู่แล้ว - สลับที่กัน
        newPieces[targetPieceIndex] = {
          ...newPieces[targetPieceIndex],
          currentPosition: fromPosition
        }
      }

      // ย้ายชิ้นไปตำแหน่งใหม่
      newPieces[pieceIndex] = {
        ...newPieces[pieceIndex],
        currentPosition: toPosition
      }

      // เล่นเสียง
      const isCorrect = newPieces[pieceIndex].correctPosition === toPosition
      if (toPosition !== -1) {
        // วางบนกระดาน
        if (isCorrect) {
          audioManager.playCorrect()
        } else {
          audioManager.playFail()
        }
      } else {
        // ลากกลับไปที่ถาด
        audioManager.playClick()
      }

      // ตรวจสอบความสำเร็จ
      const allCorrect = newPieces.every(p => 
        p.currentPosition === p.correctPosition
      )
      
      if (allCorrect) {
        setTimeout(() => {
          setIsComplete(true)
          audioManager.playEndgame()
        }, 300)
      }

      return newPieces
    })
  }

  // นำชิ้นส่วนกลับไปพื้นที่
  const removePiece = (pieceId: number) => {
    setPieces(prevPieces => {
      const newPieces = [...prevPieces]
      const pieceIndex = newPieces.findIndex(p => p.id === pieceId)
      if (pieceIndex === -1) return prevPieces

      newPieces[pieceIndex] = {
        ...newPieces[pieceIndex],
        currentPosition: -1
      }

      audioManager.playClick()
      return newPieces
    })
  }

  // หาชิ้นส่วนที่อยู่ในตำแหน่งนั้นๆ
  const getPieceAtPosition = (position: number): PuzzlePiece | undefined => {
    return pieces.find(p => p.currentPosition === position)
  }

  // หาชิ้นส่วนที่อยู่ในพื้นที่
  const getPiecesInTray = (): PuzzlePiece[] => {
    return pieces.filter(p => p.currentPosition === -1)
  }

  return (
    <div className="puzzle-board-container">
      <div className="puzzle-controls">
        <button
          className="hint-btn"
          onClick={() => {
            setShowHint(!showHint)
            audioManager.playClick()
          }}
        >
          {showHint ? '🔍 ซ่อนคำใบ้' : '💡 แสดงคำใบ้'}
        </button>
        
        <button
          className="shuffle-btn"
          onClick={() => {
            sliceImage()
            audioManager.playClick()
          }}
        >
          🔀 เริ่มใหม่
        </button>
      </div>

      <div className="puzzle-game-layout">
        {/* กระดานจิ๊กซอว์ */}
        <div 
          className="puzzle-grid"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, position) => {
            const piece = getPieceAtPosition(position)
            const isCorrect = piece?.correctPosition === position
            
            return (
              <PuzzleSlot
                key={position}
                position={position}
                piece={piece}
                movePiece={movePiece}
                removePiece={removePiece}
                showHint={showHint}
                isCorrect={isCorrect}
              />
            )
          })}
        </div>

        {/* พื้นที่ชิ้นส่วน */}
        <div className="pieces-tray">
          <h3>🧩 ชิ้นส่วนจิ๊กซอว์</h3>
          <div className="pieces-grid">
            {getPiecesInTray().map((piece) => (
              <DraggablePiece
                key={piece.id}
                piece={piece}
                showHint={showHint}
              />
            ))}
          </div>
          {getPiecesInTray().length === 0 && (
            <p className="tray-empty">✅ วางชิ้นส่วนครบแล้ว!</p>
          )}
        </div>
      </div>

      {isComplete && (
        <div className="completion-overlay">
          <div className="completion-message bounce">
            <div className="completion-icon">🎉</div>
            <h2>ยินดีด้วย!</h2>
            <p>คุณต่อจิ๊กซอว์สำเร็จแล้ว! 🎊</p>
            <button
              className="play-again-btn"
              onClick={() => {
                sliceImage()
                setIsComplete(false)
              }}
            >
              เล่นอีกครั้ง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ช่องในกระดานจิ๊กซอว์
interface PuzzleSlotProps {
  position: number
  piece: PuzzlePiece | undefined
  movePiece: (pieceId: number, toPosition: number) => void
  removePiece: (pieceId: number) => void
  showHint: boolean
  isCorrect: boolean
}

function PuzzleSlot({ position, piece, movePiece, removePiece, showHint, isCorrect }: PuzzleSlotProps) {
  const [hasWrongPiece, setHasWrongPiece] = useState(false)
  
  // รับชิ้นส่วนที่ถูกลากมา
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'PUZZLE_PIECE',
    drop: (item: { pieceId: number; correctPosition: number }) => {
      // ตรวจสอบว่าวางถูกหรือผิด
      const isCorrectDrop = item.correctPosition === position
      
      if (isCorrectDrop) {
        // วางถูก - ปิดสีแดง
        setHasWrongPiece(false)
      } else {
        // วางผิด - เปิดสีแดงค้างไว้
        setHasWrongPiece(true)
      }
      
      movePiece(item.pieceId, position)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }), [position])

  // ทำให้ชิ้นที่อยู่ในช่องลากได้
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PUZZLE_PIECE',
    item: piece ? { pieceId: piece.id, correctPosition: piece.correctPosition } : null,
    canDrag: () => piece !== undefined,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [piece])

  const combinedRef = (node: HTMLDivElement | null) => {
    drag(node)
    drop(node)
  }

  // ถ้าไม่มีชิ้นแล้ว ปิดสีแดง
  useEffect(() => {
    if (!piece) {
      setHasWrongPiece(false)
    }
  }, [piece])

  return (
    <div
      ref={combinedRef}
      className={`board-slot ${isOver && canDrop ? 'drop-target' : ''} ${piece ? 'filled' : ''} ${isDragging ? 'dragging' : ''} ${isCorrect && showHint ? 'correct-hint' : ''} ${hasWrongPiece && piece ? 'wrong-drop' : ''}`}
      onClick={() => {
        if (piece) removePiece(piece.id)
      }}
    >
      {piece ? (
        <img
          src={piece.imageData}
          alt={`Piece ${piece.id}`}
          className="placed-piece-image"
          draggable={false}
        />
      ) : (
        <div className="empty-slot-content">
          {showHint && <div className="slot-hint-number">{position + 1}</div>}
        </div>
      )}
    </div>
  )
}

// ชิ้นส่วนที่ลากได้จากพื้นที่
interface DraggablePieceProps {
  piece: PuzzlePiece
  showHint: boolean
}

function DraggablePiece({ piece, showHint }: DraggablePieceProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PUZZLE_PIECE',
    item: { pieceId: piece.id, correctPosition: piece.correctPosition },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [piece.id, piece.correctPosition])

  return (
    <div
      ref={drag}
      className={`draggable-piece ${isDragging ? 'dragging' : ''}`}
    >
      <img
        src={piece.imageData}
        alt={`Piece ${piece.id}`}
        className="piece-image"
        draggable={false}
      />
      {showHint && (
        <div className="piece-number">{piece.correctPosition + 1}</div>
      )}
    </div>
  )
}

export default PuzzleBoard
