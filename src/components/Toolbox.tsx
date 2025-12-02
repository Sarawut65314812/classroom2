import { audioManager } from '../utils/audio'
import './Toolbox.css'

interface ToolboxProps {
  currentColor: string
  onColorChange: (color: string) => void
  brushSize: number
  onBrushSizeChange: (size: number) => void
  onUndo: () => void
  onClear: () => void
  onSave: () => void
  showOutline: boolean
  onToggleOutline: () => void
  isEraser: boolean
  onToggleEraser: () => void
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A569BD',
  '#52BE80', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6',
  '#1ABC9C', '#E67E22', '#34495E', '#FFFFFF', '#000000'
]

function Toolbox({
  currentColor,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  onUndo,
  onClear,
  onSave,
  showOutline,
  onToggleOutline,
  isEraser,
  onToggleEraser
}: ToolboxProps) {
  
  const handleColorClick = (color: string) => {
    onColorChange(color)
    audioManager.playClick()
  }

  return (
    <div className="toolbox">
      <h3>🎨 เครื่องมือ</h3>

      <div className="tool-section">
        <label>🎨 เลือกสี</label>
        <div className="color-palette">
          {COLORS.map(color => (
            <button
              key={color}
              className={`color-btn ${currentColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorClick(color)}
              aria-label={`เลือกสี ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="tool-section">
        <label>🖌️ ขนาดพู่กัน: {brushSize}px</label>
        <input
          type="range"
          min="2"
          max="50"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="slider"
        />
        <div className="brush-preview" style={{
          width: brushSize,
          height: brushSize,
          backgroundColor: currentColor
        }} />
      </div>

      <div className="tool-section">
        <label>🖌️ โหมด</label>
        <div className="button-group">
          <button 
            className={`tool-btn ${!isEraser ? 'active' : ''}`} 
            onClick={() => { if (isEraser) onToggleEraser(); audioManager.playClick(); }}
          >
            ✏️ พู่กัน
          </button>
          <button 
            className={`tool-btn ${isEraser ? 'active' : ''}`} 
            onClick={() => { if (!isEraser) onToggleEraser(); audioManager.playClick(); }}
          >
            🧹 ยางลบ
          </button>
        </div>
      </div>

      <div className="tool-section">
        <button className="tool-btn" onClick={() => { onToggleOutline(); audioManager.playClick(); }}>
          {showOutline ? '👁️ ซ่อนเส้นขอบ' : '👁️ แสดงเส้นขอบ'}
        </button>
      </div>

      <div className="tool-section">
        <button className="tool-btn secondary" onClick={onUndo}>
          ↶ ย้อนกลับ
        </button>
        <button className="tool-btn danger" onClick={onClear}>
          🗑️ ลบทั้งหมด
        </button>
        <button className="tool-btn success" onClick={onSave}>
          💾 บันทึก
        </button>
      </div>
    </div>
  )
}

export default Toolbox
    