import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || id.includes('..') || id.includes('/') || id.includes('\\')) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'temp', id);
    
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}