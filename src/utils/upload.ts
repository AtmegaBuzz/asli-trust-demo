

interface UploadResponse {
  message: string
  path: string
  url: string
  size: number
  type: string
}

interface ErrorResponse {
  error: string
}


export const uploadFileToAPI = async (
  file: File,
  endpoint: string = '/api/upload'
): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData, // Next.js handles this automatically
    })

    if (!response.ok) {
      const errorData = await response.json() as ErrorResponse
      throw new Error(errorData.error || 'Upload failed')
    }

    const result = await response.json() as UploadResponse
    return result
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

// Upload with progress tracking
export const uploadFileWithProgress = async (
  file: File,
  endpoint: string = '/api/upload',
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText) as UploadResponse
          resolve(result)
        } catch (error) {
          reject(new Error('Failed to parse response'))
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText) as ErrorResponse
          reject(new Error(errorData.error || 'Upload failed'))
        } catch (error) {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.open('POST', endpoint)
    xhr.send(formData)
  })
}