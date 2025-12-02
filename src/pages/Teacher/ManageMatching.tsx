import { useState, useEffect } from 'react'
import {
  getMatchingPairs,
  addMatchingPair,
  deleteMatchingPair,
  saveMatchingPairs,
  getImages,
  MatchingPair
} from '../../services/storage'
import './ManageMatching.css'

function ManageMatching() {
  const [pairs, setPairs] = useState<MatchingPair[]>([])
  const [images, setImages] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    leftImage: '',
    rightImage: '',
    leftText: '',
    rightText: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setPairs(getMatchingPairs())
    setImages(getImages().filter(img => img.category === 'matching'))
  }

  const handleSubmit = () => {
    if (!formData.leftImage || !formData.rightImage) {
      alert('กรุณาเลือกรูปภาพทั้ง 2 ฝั่ง')
      return
    }

    if (editingId !== null) {
      const updatedPairs = pairs.map(p =>
        p.id === editingId ? { ...p, ...formData } : p
      )
      saveMatchingPairs(updatedPairs)
    } else {
      addMatchingPair(formData)
    }

    resetForm()
    loadData()
  }

  const handleEdit = (pair: MatchingPair) => {
    setEditingId(pair.id)
    setFormData({
      leftImage: pair.leftImage,
      rightImage: pair.rightImage,
      leftText: pair.leftText || '',
      rightText: pair.rightText || ''
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('ต้องการลบคู่นี้หรือไม่?')) {
      deleteMatchingPair(id)
      loadData()
    }
  }

  const resetForm = () => {
    setFormData({ leftImage: '', rightImage: '', leftText: '', rightText: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      if (side === 'left') {
        setFormData({ ...formData, leftImage: url })
      } else {
        setFormData({ ...formData, rightImage: url })
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="manage-matching">
      <div className="page-header">
        <h1>🎯 จัดการเกมจับคู่</h1>
        <div className="header-actions">
          <button className="back-btn" onClick={() => window.history.back()}>
            ← กลับ
          </button>
          <button
            className="add-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ ยกเลิก' : '➕ เพิ่มคู่ใหม่'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="pair-form">
          <h2>{editingId !== null ? '✏️ แก้ไขคู่' : '➕ เพิ่มคู่ใหม่'}</h2>
          
          <div className="form-row">
            <div className="form-column">
              <h3>ฝั่งซ้าย</h3>
              
              <label>รูปภาพ</label>
              <div className="image-selector">
                {formData.leftImage ? (
                  <div className="selected-image">
                    <img src={formData.leftImage} alt="Left" />
                    <button onClick={() => setFormData({ ...formData, leftImage: '' })}>
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
                        onChange={(e) => handleImageUpload(e, 'left')}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <div className="gallery-images">
                      {images.map(img => (
                        <img
                          key={img.id}
                          src={img.url}
                          alt={img.name}
                          onClick={() => setFormData({ ...formData, leftImage: img.url })}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <label>ข้อความ (ถ้ามี)</label>
              <input
                type="text"
                value={formData.leftText}
                onChange={(e) => setFormData({ ...formData, leftText: e.target.value })}
                placeholder="เช่น แมว"
              />
            </div>

            <div className="form-column">
              <h3>ฝั่งขวา</h3>
              
              <label>รูปภาพ</label>
              <div className="image-selector">
                {formData.rightImage ? (
                  <div className="selected-image">
                    <img src={formData.rightImage} alt="Right" />
                    <button onClick={() => setFormData({ ...formData, rightImage: '' })}>
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
                        onChange={(e) => handleImageUpload(e, 'right')}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <div className="gallery-images">
                      {images.map(img => (
                        <img
                          key={img.id}
                          src={img.url}
                          alt={img.name}
                          onClick={() => setFormData({ ...formData, rightImage: img.url })}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <label>ข้อความ (ถ้ามี)</label>
              <input
                type="text"
                value={formData.rightText}
                onChange={(e) => setFormData({ ...formData, rightText: e.target.value })}
                placeholder="เช่น Cat"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="submit-btn" onClick={handleSubmit}>
              ✅ {editingId !== null ? 'บันทึก' : 'เพิ่มคู่'}
            </button>
            <button className="cancel-btn" onClick={resetForm}>
              ❌ ยกเลิก
            </button>
          </div>
        </div>
      )}

      <div className="pairs-list">
        <h2>คู่ทั้งหมด ({pairs.length} คู่)</h2>
        
        {pairs.length === 0 ? (
          <div className="empty-state">
            <p>ยังไม่มีคู่จับคู่</p>
            <small>กดปุ่ม "เพิ่มคู่ใหม่" เพื่อเริ่มต้น</small>
          </div>
        ) : (
          <div className="pairs-grid">
            {pairs.map(pair => (
              <div key={pair.id} className="pair-card">
                <div className="pair-content">
                  <div className="pair-side">
                    <img src={pair.leftImage} alt="Left" />
                    {pair.leftText && <p>{pair.leftText}</p>}
                  </div>
                  <div className="pair-connector">↔️</div>
                  <div className="pair-side">
                    <img src={pair.rightImage} alt="Right" />
                    {pair.rightText && <p>{pair.rightText}</p>}
                  </div>
                </div>
                <div className="pair-actions">
                  <button onClick={() => handleEdit(pair)} className="edit-btn">
                    ✏️ แก้ไข
                  </button>
                  <button onClick={() => handleDelete(pair.id)} className="delete-btn">
                    🗑️ ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageMatching
