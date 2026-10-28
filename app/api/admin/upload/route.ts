import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { verifyAdminSession } from '@/lib/auth';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jfif'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/admin/upload
 * Handles authenticated admin file uploads to Supabase Storage ('sarees' bucket).
 * Returns the permanent public CDN URL for the uploaded asset.
 */
export async function POST(req: NextRequest) {
  const auth = await verifyAdminSession(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const adminClient = getAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { success: false, error: 'Database and storage service is not configured' },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file was provided in the request' },
        { status: 400 }
      );
    }

    // 1. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed limit of 10MB' },
        { status: 400 }
      );
    }

    // 2. Validate MIME type
    const mimeType = file.type || 'image/jpeg';
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type "${mimeType}". Please upload a JPEG, PNG, WebP, or JFIF image.`,
        },
        { status: 400 }
      );
    }

    // 3. Determine extension and generate unique sanitized file path
    let ext = 'jpg';
    if (mimeType === 'image/png') ext = 'png';
    else if (mimeType === 'image/webp') ext = 'webp';
    else if (mimeType === 'image/jfif') ext = 'jfif';
    else if (file.name.includes('.')) {
      const parts = file.name.split('.');
      ext = parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const storagePath = `saree-${Date.now()}-${randomSuffix}.${ext}`;

    // 4. Convert file to buffer and upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadErr } = await adminClient.storage
      .from('sarees')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadErr) {
      console.error('Supabase storage upload error:', uploadErr);
      return NextResponse.json(
        { success: false, error: uploadErr.message || 'Storage upload failed' },
        { status: 500 }
      );
    }

    // 5. Retrieve public CDN URL
    const { data: urlData } = adminClient.storage.from('sarees').getPublicUrl(storagePath);

    return NextResponse.json(
      {
        success: true,
        url: urlData.publicUrl,
        path: uploadData.path,
        fileName: file.name,
        size: file.size,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Upload endpoint exception:', error);
    const msg = error instanceof Error ? error.message : 'Upload processing failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
