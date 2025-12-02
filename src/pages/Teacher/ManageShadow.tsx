import { useState, useEffect } from 'react'
import {
  getShadowItems,
  addShadowItem,
  deleteShadowItem,
  getImages
} from '../../services/storage'
import './ManageShadow.css'

function ManageShadow() {
  const [items, setItems] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    realImage: '',
    shadowImage: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setItems(getShadowItems())
    setImages(getImages().filter(img => img.category === 'shadow'))
  }

  const generateNonOverlappingPositions = (existingItems: any[], newCount: number = 1) => {
    const positions: Array<{realX: number, realY: number, shadowX: number, shadowY: number}> = []
    const minDistance = 150 // ระยะห่างขั้นต่ำระหว่างรูป
    const maxAttempts = 50 // จำนวนครั้งสูงสุดในการหาตำแหน่งที่ไม่ซ้อน
    
    // เก็บตำแหน่งที่มีอยู่แล้ว
    const existingPositions = existingItems.map(item => [
      {x: item.realX, y: item.realY},
      {x: item.shadowX, y: item.shadowY}
    ]).flat()

    for (let i = 0; i < newCount; i++) {
      let attempts = 0
      let validPosition = false
      let realX = 0, realY = 0, shadowX = 0, shadowY = 0

      while (!validPosition && attempts < maxAttempts) {
        // สุ่มตำแหน่งฝั่งซ้าย (รูปจริง)
        realX = Math.random() * 200 + 50
        realY = Math.random() * 400 + 50
        
        // สุ่มตำแหน่งฝั่งขวา (เงา)
        shadowX = Math.random() * 200 + 600
        shadowY = Math.random() * 400 + 50

        // ตรวจสอบว่าไม่ทับกับตำแหน่งที่มีอยู่
        const tooClose = [...existingPositions, ...positions.map(p => [{x: p.realX, y: p.realY}, {x: p.shadowX, y: p.shadowY}]).flat()]
          .some(pos => {
            const distToReal = Math.sqrt(Math.pow(pos.x - realX, 2) + Math.pow(pos.y - realY, 2))
            const distToShadow = Math.sqrt(Math.pow(pos.x - shadowX, 2) + Math.pow(pos.y - shadowY, 2))
            return distToReal < minDistance || distToShadow < minDistance
          })

        if (!tooClose) {
          validPosition = true
        }
        attempts++
      }

      positions.push({realX, realY, shadowX, shadowY})
    }

    return positions[0]
  }

  const handleSubmit = () => {
    if (!formData.realImage || !formData.shadowImage) {
      alert('กรุณาเลือกรูปจริงและรูปเงา')
      return
    }

    // สร้างตำแหน่งที่ไม่ทับกัน
    const position = generateNonOverlappingPositions(items)

    addShadowItem({
      ...formData,
      ...position,
      placed: false
    })

    setFormData({ realImage: '', shadowImage: '' })
    setShowForm(false)
    loadData()
  }

  const handleDelete = (id: string) => {
    if (confirm('ต้องการลบรายการนี้หรือไม่?')) {
      deleteShadowItem(id)
      loadData()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'real' | 'shadow') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      if (type === 'real') {
        setFormData({ ...formData, realImage: url })
      } else {
        setFormData({ ...formData, shadowImage: url })
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="manage-shadow">
      <div className="page-header">
        <h1>🌙 จัดการเกมจับคู่เงา</h1>
        <div className="header-actions">
          <button className="back-btn" onClick={() => window.history.back()}>
            ← กลับ
          </button>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? '❌ ยกเลิก' : '➕ เพิ่มรายการใหม่'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="shadow-form">
          <h2>➕ เพิ่มรายการใหม่</h2>
          
          <div className="form-row">
            <div className="form-column">
              <h3>รูปจริง</h3>
              {formData.realImage ? (
                <div className="selected-image">
                  <img src={formData.realImage} alt="Real" />
                  <button onClick={() => setFormData({ ...formData, realImage: '' })}>
                    ❌ ลบ
                  </button>
                </div>
              ) : (
                <div className="image-options">
                  <label className="upload-btn">
                    📤 อัปโหลด
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'real')}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <div className="gallery-images">
                    {images.map(img => (
                      <img
                        key={img.id}
                        src={img.url}
                        alt={img.name}
                        onClick={() => setFormData({ ...formData, realImage: img.url })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-column">
              <h3>รูปเงา</h3>
              {formData.shadowImage ? (
                <div className="selected-image">
                  <img src={formData.shadowImage} alt="Shadow" />
                  <button onClick={() => setFormData({ ...formData, shadowImage: '' })}>
                    ❌ ลบ
                  </button>
                </div>
              ) : (
                <div className="image-options">
                  <label className="upload-btn">
                    📤 อัปโหลด
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'shadow')}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <div className="gallery-images">
                    {images.map(img => (
                      <img
                        key={img.id}
                        src={img.url}
                        alt={img.name}
                        onClick={() => setFormData({ ...formData, shadowImage: img.url })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button className="submit-btn" onClick={handleSubmit}>
              ✅ เพิ่มรายการ
            </button>
            <button className="cancel-btn" onClick={() => setShowForm(false)}>
              ❌ ยกเลิก
            </button>
          </div>
        </div>
      )}

      <div className="items-list">
        <h2>รายการทั้งหมด ({items.length} รายการ)</h2>
        
        {items.length === 0 ? (
          <div className="empty-state">
            <p>ยังไม่มีรายการ</p>
            <small>กดปุ่ม "เพิ่มรายการใหม่" เพื่อเริ่มต้น</small>
          </div>
        ) : (
          <div className="items-grid">
            {items.map(item => (
              <div key={item.id} className="item-card">
                <div className="item-content">
                  <div className="item-side">
                    <p>รูปจริง</p>
                    <img src={item.realImage} alt="Real" />
                  </div>
                  <div className="item-connector">→</div>
                  <div className="item-side">
                    <p>รูปเงา</p>
                    <img src={item.shadowImage} alt="Shadow" />
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)} className="delete-btn">
                  🗑️ ลบ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageShadow
