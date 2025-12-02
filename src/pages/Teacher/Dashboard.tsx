import { useState, useEffect } from 'react'
import './Dashboard.css'

interface Activity {
  id: string
  name: string
  type: 'coloring' | 'puzzle'
  imageUrl: string
  difficulty?: string
  createdAt: string
}

interface Student {
  id: string
  name: string
  score: number
  completedAt?: string
}

function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [students] = useState<Student[]>([
    { id: '1', name: 'น้องแมว', score: 95, completedAt: '2024-12-01' },
    { id: '2', name: 'น้องหมา', score: 88, completedAt: '2024-12-01' },
    { id: '3', name: 'น้องเป็ด', score: 92, completedAt: '2024-12-01' },
  ])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newActivity, setNewActivity] = useState({
    name: '',
    type: 'coloring' as 'coloring' | 'puzzle',
    imageUrl: '',
    difficulty: 'easy'
  })

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      // Mock data for demo
      setActivities([
        {
          id: '1',
          name: 'ระบายสีสัตว์',
          type: 'coloring',
          imageUrl: 'https://via.placeholder.com/200',
          createdAt: '2024-12-01'
        },
        {
          id: '2',
          name: 'จิ๊กซอว์ผลไม้',
          type: 'puzzle',
          imageUrl: 'https://via.placeholder.com/200',
          difficulty: 'easy',
          createdAt: '2024-12-01'
        }
      ])
    } catch (error) {
      console.error('Error loading activities:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setNewActivity({ ...newActivity, imageUrl: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateActivity = async () => {
    if (!newActivity.name || !newActivity.imageUrl) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      const activity: Activity = {
        id: Date.now().toString(),
        ...newActivity,
        createdAt: new Date().toISOString()
      }
      setActivities([...activities, activity])
      setShowCreateForm(false)
      setNewActivity({ name: '', type: 'coloring', imageUrl: '', difficulty: 'easy' })
      alert('สร้างกิจกรรมสำเร็จ! 🎉')
    } catch (error) {
      console.error('Error creating activity:', error)
      alert('เกิดข้อผิดพลาด')
    }
  }

  const exportCSV = () => {
    const csv = [
      ['ชื่อ', 'คะแนน', 'วันที่ทำเสร็จ'],
      ...students.map(s => [s.name, s.score, s.completedAt || '-'])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `students-${Date.now()}.csv`
    link.click()
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>👩‍🏫 หน้าครู - จัดการห้องเรียน</h1>
        <button className="back-btn" onClick={() => window.history.back()}>
          ← กลับหน้าหลัก
        </button>
      </div>

      <div className="dashboard-content">
        {/* Activities Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>📚 กิจกรรมทั้งหมด</h2>
            <button
              className="create-btn"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? '❌ ยกเลิก' : '➕ สร้างกิจกรรมใหม่'}
            </button>
          </div>

          {showCreateForm && (
            <div className="create-form fade-in">
              <h3>สร้างกิจกรรมใหม่</h3>
              
              <div className="form-group">
                <label>ชื่อกิจกรรม</label>
                <input
                  type="text"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  placeholder="เช่น ระบายสีสัตว์"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>ประเภทเกม</label>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as any })}
                  className="form-select"
                >
                  <option value="coloring">🎨 ระบายสี</option>
                  <option value="puzzle">🧩 จิ๊กซอว์</option>
                </select>
              </div>

              {newActivity.type === 'puzzle' && (
                <div className="form-group">
                  <label>ความยาก</label>
                  <select
                    value={newActivity.difficulty}
                    onChange={(e) => setNewActivity({ ...newActivity, difficulty: e.target.value })}
                    className="form-select"
                  >
                    <option value="easy">ง่าย (3×3)</option>
                    <option value="medium">ปานกลาง (4×4)</option>
                    <option value="hard">ยาก (5×5)</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>อัปโหลดรูปภาพ</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="form-file"
                />
                {newActivity.imageUrl && (
                  <img src={newActivity.imageUrl} alt="Preview" className="preview-img" />
                )}
              </div>

              <button className="submit-btn" onClick={handleCreateActivity}>
                ✅ สร้างกิจกรรม
              </button>
            </div>
          )}

          <div className="activities-grid">
            {activities.map(activity => (
              <div key={activity.id} className="activity-card">
                <img src={activity.imageUrl} alt={activity.name} />
                <div className="activity-info">
                  <h3>{activity.name}</h3>
                  <p>
                    {activity.type === 'coloring' ? '🎨 ระบายสี' : '🧩 จิ๊กซอว์'}
                    {activity.difficulty && ` - ${activity.difficulty}`}
                  </p>
                  <small>{new Date(activity.createdAt).toLocaleDateString('th-TH')}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Students Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>👥 นักเรียนและคะแนน</h2>
            <button className="export-btn" onClick={exportCSV}>
              📊 Export CSV
            </button>
          </div>

          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ชื่อนักเรียน</th>
                  <th>คะแนน</th>
                  <th>วันที่ทำเสร็จ</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>{student.name}</td>
                    <td>
                      <div className="score-badge">{student.score}</div>
                    </td>
                    <td>{student.completedAt || '-'}</td>
                    <td>
                      <span className={`status-badge ${student.score >= 80 ? 'pass' : 'fail'}`}>
                        {student.score >= 80 ? '✅ ผ่าน' : '⏳ รอ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>🖼️ คลังรูปภาพ</h2>
            <button className="upload-btn">
              📤 อัปโหลดรูปใหม่
            </button>
          </div>
          
          <div className="gallery-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="gallery-item">
                <img src={`https://via.placeholder.com/150`} alt={`Gallery ${i}`} />
                <button className="delete-btn">🗑️</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
