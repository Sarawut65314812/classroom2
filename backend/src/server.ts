import express, { Request, Response } from 'express'
import cors from 'cors'
import multer from 'multer'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'))
    }
  }
})

// In-memory storage (replace with database in production)
let activities: any[] = []
let gallery: any[] = []
let submissions: any[] = []

// Routes

// Upload image
app.post('/api/upload-image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Optimize image with Sharp
    const optimizedFilename = 'optimized-' + req.file.filename
    await sharp(req.file.path)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join('uploads', optimizedFilename))

    const imageUrl = `/uploads/${optimizedFilename}`
    
    gallery.push({
      id: Date.now().toString(),
      url: imageUrl,
      originalName: req.file.originalname,
      createdAt: new Date().toISOString()
    })

    res.json({ imageUrl, message: 'Image uploaded successfully' })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Failed to upload image' })
  }
})

// Slice image for puzzle
app.post('/api/slice-image', async (req: Request, res: Response) => {
  try {
    const { imageUrl, level } = req.body
    
    const gridSize = level === 'easy' ? 3 : level === 'medium' ? 4 : 5
    
    // Return configuration for client-side slicing
    res.json({
      gridSize,
      pieces: gridSize * gridSize,
      message: 'Slice configuration ready'
    })
  } catch (error) {
    console.error('Slice error:', error)
    res.status(500).json({ error: 'Failed to slice image' })
  }
})

// Get gallery images
app.get('/api/gallery', (req: Request, res: Response) => {
  res.json(gallery)
})

// Create activity
app.post('/api/activity', (req: Request, res: Response) => {
  try {
    const activity = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
    activities.push(activity)
    res.json(activity)
  } catch (error) {
    console.error('Create activity error:', error)
    res.status(500).json({ error: 'Failed to create activity' })
  }
})

// Get all activities
app.get('/api/activities', (req: Request, res: Response) => {
  res.json(activities)
})

// Get activity results
app.get('/api/activity/:id/results', (req: Request, res: Response) => {
  const { id } = req.params
  const results = submissions.filter((s: any) => s.activityId === id)
  res.json(results)
})

// Submit student work
app.post('/api/submit', (req: Request, res: Response) => {
  try {
    const submission = {
      id: Date.now().toString(),
      ...req.body,
      submittedAt: new Date().toISOString()
    }
    submissions.push(submission)
    res.json({ message: 'Submission successful', submission })
  } catch (error) {
    console.error('Submit error:', error)
    res.status(500).json({ error: 'Failed to submit work' })
  }
})

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📁 Uploads directory: ${path.resolve('uploads')}`)
})
