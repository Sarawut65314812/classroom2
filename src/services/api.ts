import axios from 'axios'

const API_BASE_URL = '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Image upload
export const uploadImage = async (file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  
  const response = await api.post('/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

// Get gallery images
export const getGallery = async () => {
  const response = await api.get('/gallery')
  return response.data
}

// Slice image for puzzle
export const sliceImage = async (imageUrl: string, level: string) => {
  const response = await api.post('/slice-image', { imageUrl, level })
  return response.data
}

// Activities
export const createActivity = async (activityData: any) => {
  const response = await api.post('/activity', activityData)
  return response.data
}

export const getActivities = async () => {
  const response = await api.get('/activities')
  return response.data
}

export const getActivityResults = async (activityId: string) => {
  const response = await api.get(`/activity/${activityId}/results`)
  return response.data
}

// Submit student work
export const submitWork = async (workData: any) => {
  const response = await api.post('/submit', workData)
  return response.data
}
