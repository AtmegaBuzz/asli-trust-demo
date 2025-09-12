import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

// Helper function to read file as ArrayBuffer (compatible approach)
const fileToArrayBuffer = async (file: File): Promise<ArrayBuffer> => {
  // Modern browsers support file.arrayBuffer()
  if (typeof (file as any).arrayBuffer === 'function') {
    return await (file as any).arrayBuffer()
  }

  // Fallback for older environments
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'))
      }
    }
    reader.onerror = () => reject(reader.error || new Error('FileReader error'))
    reader.readAsArrayBuffer(file)
  })
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse | ErrorResponse>> {
  try {
    // Next.js automatically handles FormData parsing
    const formData = await request.formData()
    const fileBlob = formData.get('file') as Blob | null
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`
      }, { status: 400 })
    }

    // Convert File to buffer using compatible method
    const arrayBuffer = await fileBlob?.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer!)

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || ''
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath)

    return NextResponse.json({
      message: 'File uploaded successfully',
      path: data.fullPath,
      url: publicUrl,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
