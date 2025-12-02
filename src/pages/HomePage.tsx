import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="home-page">
      <Link to="/teacher" className="teacher-link">
        👩‍🏫 หน้าครู
      </Link>
      
      <h1 className="home-title">🎨 ห้องเรียนสนุก 🎮</h1>
      
      <div className="game-cards">
        <Link to="/coloring" className="game-card">
          <div className="game-icon">🎨</div>
          <h2>ระบายสี</h2>
          <p>สนุกกับการวาดและระบายสีด้วยนิ้วหรือปากกาสไตลัส</p>
        </Link>
        
        <Link to="/puzzle" className="game-card">
          <div className="game-icon">🧩</div>
          <h2>จิ๊กซอว์</h2>
          <p>ต่อภาพจิ๊กซอว์สนุก ๆ ลากวางชิ้นส่วนให้ถูกที่</p>
        </Link>

        <Link to="/matching" className="game-card">
          <div className="game-icon">🎯</div>
          <h2>โยงเส้นจับคู่</h2>
          <p>ลากเส้นเชื่อมรูปภาพที่เข้าคู่กัน</p>
        </Link>

        <Link to="/beads" className="game-card">
          <div className="game-icon">🎮</div>
          <h2>ลูกปัดลอย</h2>
          <p>แตะลูกปัดตามลำดับหรือลากใส่ตะกร้า</p>
        </Link>

        <Link to="/shadow" className="game-card">
          <div className="game-icon">🌙</div>
          <h2>ลากเงาให้ตรง</h2>
          <p>ลากรูปภาพไปจับคู่กับเงาที่ตรงกัน</p>
        </Link>
      </div>
    </div>
  )
}

export default HomePage
