import { playWav } from '@/lib/ffmpegCtrl';
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false });
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const path = `/tmp/voice-${Date.now()}.wav`
    await writeFile(path, buffer)
    const res = await playWav(path);

    return NextResponse.json({ success: true, result: res });
}
