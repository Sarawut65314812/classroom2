import { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva'
import Toolbox from '../../components/Toolbox'
import { audioManager } from '../../utils/audio'
import './PlayColoring.css'

interface LineData {
  points: number[]
  stroke: string
  strokeWidth: number
}

function PlayColoring() {
  const [lines, setLines] = useState<LineData[]>([])
  const [currentColor, setCurrentColor] = useState('#FF6B6B')
  const [brushSize, setBrushSize] = useState(10)
  const [isDrawing, setIsDrawing] = useState(false)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [showOutline, setShowOutline] = useState(true)
  const [isEraser, setIsEraser] = useState(false)
  const stageRef = useRef<any>(null)

  useEffect(() => {
    // Load default image
    const img = new window.Image()
    img.src = 'https://via.placeholder.com/600x400/FFFFFF/000000?text=Upload+Image'
    img.onload = () => {
      setImage(img)
    }
  }, [])

  const handleMouseDown = (e: any) => {
    setIsDrawing(true)
    const pos = e.target.getStage().getPointerPosition()
    const color = isEraser ? '#FFFFFF' : currentColor
    const size = isEraser ? brushSize * 2 : brushSize
    setLines([...lines, { points: [pos.x, pos.y], stroke: color, strokeWidth: size }])
    audioManager.playClick()
  }

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return

    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    const lastLine = lines[lines.length - 1]
    
    if (lastLine) {
      lastLine.points = lastLine.points.concat([point.x, point.y])
      setLines([...lines.slice(0, -1), lastLine])
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleUndo = () => {
    if (lines.length > 0) {
      setLines(lines.slice(0, -1))
      audioManager.playClick()
    }
  }

  const handleClear = () => {
    setLines([])
    audioManager.playClick()
  }

  const handleSave = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL()
      const link = document.createElement('a')
      link.download = `my-drawing-${Date.now()}.png`
      link.href = uri
      link.click()
      audioManager.playSuccess()
      alert('บันทึกภาพเรียบร้อย! 🎉')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new window.Image()
        img.src = event.target?.result as string
        img.onload = () => {
          setImage(img)
          setLines([]) // Clear existing drawing
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="coloring-page">
      <div className="coloring-header">
        <h1>🎨 ระบายสี</h1>
        <button className="back-btn" onClick={() => window.history.back()}>
          ← กลับ
        </button>
      </div>

      <div className="coloring-container">
        <Toolbox
          currentColor={currentColor}
          onColorChange={setCurrentColor}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          onUndo={handleUndo}
          onClear={handleClear}
          onSave={handleSave}
          showOutline={showOutline}
          onToggleOutline={() => setShowOutline(!showOutline)}
          onImageUpload={handleImageUpload}
          isEraser={isEraser}
          onToggleEraser={() => setIsEraser(!isEraser)}
        />

        <div className="canvas-wrapper">
          <Stage
            width={800}
            height={600}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            ref={stageRef}
            className="drawing-stage"
          >
            <Layer>
              {image && showOutline && (
                <KonvaImage
                  image={image}
                  width={800}
                  height={600}
                  opacity={0.3}
                />
              )}
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.stroke}
                  strokeWidth={line.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation="source-over"
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>

      <div className="mascot">
        <div className="mascot-avatar">🦊</div>
        <div className="mascot-speech">วาดสวย ๆ นะ!</div>
      </div>
    </div>
  )
}

export default PlayColoring
