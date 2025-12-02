import { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva'
import Toolbox from '../../components/Toolbox'
import { audioManager } from '../../utils/audio'
import { getImages } from '../../services/storage'
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
  const [coloringImages, setColoringImages] = useState<any[]>([])
  const [isStarted, setIsStarted] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 })
  const stageRef = useRef<any>(null)

  useEffect(() => {
    // Load images from teacher
    const images = getImages().filter(img => img.category === 'coloring')
    setColoringImages(images)
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
          // คำนวณขนาด canvas ให้เต็มพื้นที่แต่คงสัดส่วน
          const maxWidth = 1200
          const maxHeight = 800
          let newWidth = img.width
          let newHeight = img.height

          // คำนวณ ratio เพื่อปรับขนาดให้พอดีกับ canvas
          const ratio = Math.min(maxWidth / newWidth, maxHeight / newHeight)
          newWidth = newWidth * ratio
          newHeight = newHeight * ratio

          setCanvasSize({ width: newWidth, height: newHeight })
          setImage(img)
          setLines([]) // Clear existing drawing
          setIsStarted(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSelectImage = (imageUrl: string) => {
    const img = new window.Image()
    img.src = imageUrl
    img.onload = () => {
      // คำนวณขนาด canvas ให้เต็มพื้นที่แต่คงสัดส่วน
      const maxWidth = 1200
      const maxHeight = 800
      let newWidth = img.width
      let newHeight = img.height

      // คำนวณ ratio เพื่อปรับขนาดให้พอดีกับ canvas
      const ratio = Math.min(maxWidth / newWidth, maxHeight / newHeight)
      newWidth = newWidth * ratio
      newHeight = newHeight * ratio

      setCanvasSize({ width: newWidth, height: newHeight })
      setImage(img)
      setLines([])
      setIsStarted(true)
      audioManager.playClick()
    }
  }

  if (!isStarted) {
    return (
      <div className="coloring-page">
        <div className="coloring-header">
          <h1>🎨 ระบายสี</h1>
          <button className="back-btn" onClick={() => window.history.back()}>
            ← กลับ
          </button>
        </div>

        <div className="coloring-setup">
          {coloringImages.length > 0 && (
            <div className="setup-section">
              <h2>🖼️ เลือกรูปจากครู</h2>
              <div className="image-gallery">
                {coloringImages.map(img => (
                  <div 
                    key={img.id} 
                    className="gallery-item"
                    onClick={() => handleSelectImage(img.url)}
                  >
                    <img src={img.url} alt={img.name} />
                    <span>{img.name}</span>
                  </div>
                ))}
              </div>
              <div className="divider">หรือ</div>
            </div>
          )}

          <div className="setup-section">
            <h2>📤 อัปโหลดรูปของคุณเอง</h2>
            <label className="upload-big-btn">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <span className="icon">📷</span>
              <span className="text">เลือกรูปภาพ</span>
              <span className="hint">รองรับ JPG, PNG</span>
            </label>
          </div>

          {coloringImages.length === 0 && (
            <div className="no-images-hint">
              <p>💡 ยังไม่มีรูประบายสีจากครู</p>
              <small>อัปโหลดรูปของคุณเองได้เลย</small>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="coloring-page">
      <div className="coloring-header">
        <h1>🎨 ระบายสี</h1>
        <div className="header-actions">
          <button className="change-image-btn" onClick={() => setIsStarted(false)}>
            🖼️ เปลี่ยนรูป
          </button>
          <button className="back-btn" onClick={() => window.history.back()}>
            ← กลับ
          </button>
        </div>
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
          isEraser={isEraser}
          onToggleEraser={() => setIsEraser(!isEraser)}
        />

        <div className="canvas-wrapper">
          <Stage
            width={canvasSize.width}
            height={canvasSize.height}
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
                  width={canvasSize.width}
                  height={canvasSize.height}
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
