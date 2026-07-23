import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const formData = await request.formData()
    
    const files = formData.getAll('files') as File[]
    const bookingId = formData.get('booking_id') as string
    const description = formData.get('description') as string

    if (!bookingId) {
      return NextResponse.json(
        { error: 'booking_id is required' },
        { status: 400 }
      )
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Verify booking exists
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const uploadedPhotos = []
    const errors = []

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        // Validate file type (images only)
        if (!file.type.startsWith('image/')) {
          errors.push({ file: file.name, error: 'Only image files are allowed' })
          continue
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
          errors.push({ file: file.name, error: 'File size exceeds 5MB limit' })
          continue
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(7)
        const fileExt = file.name.split('.').pop()
        const fileName = `${timestamp}-${randomString}.${fileExt}`
        const filePath = `bookings/${bookingId}/${fileName}`

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('service-photos')
          .upload(filePath, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Upload error for', file.name, ':', uploadError)
          
          // If bucket doesn't exist, try to create it
          if (uploadError.message.includes('Bucket not found')) {
            errors.push({
              file: file.name,
              error: 'Storage bucket not configured. Please set up "service-photos" bucket in Supabase.',
            })
          } else {
            errors.push({ file: file.name, error: uploadError.message })
          }
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('service-photos')
          .getPublicUrl(filePath)

        const photoUrl = urlData.publicUrl

        // Save photo record to database
        const { data: photo, error: photoError } = await supabase
          .from('booking_photos')
          .insert({
            booking_id: bookingId,
            photo_url: photoUrl,
            description: description || file.name,
          })
          .select()
          .single()

        if (photoError) {
          console.error('Photo record creation error:', photoError)
          errors.push({ file: file.name, error: 'Failed to save photo record' })
          
          // Clean up uploaded file
          await supabase.storage
            .from('service-photos')
            .remove([filePath])
          
          continue
        }

        uploadedPhotos.push({
          id: photo.id,
          url: photoUrl,
          filename: file.name,
          size: file.size,
          type: file.type,
        })

        console.log('✅ Photo uploaded successfully:', file.name)
      } catch (fileError: any) {
        console.error('Error processing file:', file.name, fileError)
        errors.push({ file: file.name, error: fileError.message })
      }
    }

    // Return response
    if (uploadedPhotos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No photos were uploaded successfully',
          errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        photos: uploadedPhotos,
        uploaded: uploadedPhotos.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get photos for a booking
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('booking_id')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'booking_id is required' },
        { status: 400 }
      )
    }

    const { data: photos, error } = await supabase
      .from('booking_photos')
      .select('*')
      .eq('booking_id', bookingId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Photos fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch photos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ photos: photos || [] })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete photo
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photo_id')

    if (!photoId) {
      return NextResponse.json(
        { error: 'photo_id is required' },
        { status: 400 }
      )
    }

    // Get photo details
    const { data: photo, error: photoError } = await supabase
      .from('booking_photos')
      .select('*')
      .eq('id', photoId)
      .single()

    if (photoError || !photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Extract file path from URL
    const url = new URL(photo.photo_url)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === 'service-photos')
    const filePath = pathParts.slice(bucketIndex + 1).join('/')

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('service-photos')
      .remove([filePath])

    if (deleteError) {
      console.error('Storage deletion error:', deleteError)
      // Continue to delete database record even if storage deletion fails
    }

    // Delete database record
    const { error: dbDeleteError } = await supabase
      .from('booking_photos')
      .delete()
      .eq('id', photoId)

    if (dbDeleteError) {
      return NextResponse.json(
        { error: 'Failed to delete photo record' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Photo deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
