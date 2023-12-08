//API Route: GET `/api/stream/[id]/`
//Idea from https://github.com/vercel/next.js/discussions/15453
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import fs, {Stats} from "fs";
import { getWebcamInfo, getWebcamsLists } from "@/lib/ffmpegCtrl";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import { updateStream } from "@/lib/ffmpegCtrl"
import {homedir} from "os";
import { streamFile } from "../streamfile";



/* 동작:
* camera.curStrRes, camera.curStrFps 가 slug[1], slug[2]와 일치하는지 확인
* ffmpeg를 구동
* TODO: User Authentication, File Serving, etc.
*/

interface Options {
    start: number;
    end: number;
}

function parseRangeHeader(rangeHeader: string|null, fileSize: number): Options {
    if (!rangeHeader || !/bytes=\d*-\d*(,\d*-\d*)*$/.test(rangeHeader))
    throw new Error('400'); //Bad Request
    
    const parts = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    
    if (isNaN(start) || isNaN(end) || start > end || end >= fileSize) {
        throw new Error('416'); //Range Not Satisfiable
    }
    
    return { start, end };
}

export async function GET(request: NextRequest, context: {params: {slug: string[]}}): Promise<NextResponse> {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Forbidden', {status: 403});
    }
    
    console.log(context.params.slug);
    if(context.params.slug.length != 2) 
    return new NextResponse("Not Implemented", {status: 501});
    
    const slug = context.params.slug;
    
    let fileLoc = homedir() + /.hc/;
    
    //id는 number
    if(! (/^[0-9]+$/.test(slug[0]))) {
        return new NextResponse("Camera Not found", {status: 404});
    }

    const cameraObj = await prisma.camera.findFirst({
        where: {id: parseInt(slug[0])},
    });

    if(cameraObj === null) {
        return new NextResponse("Camera Not found", {status: 404});
    }
    
    
    
    //startCameraStream
    const camDevId:string = cameraObj.camDevId;

    const micDevId:string|null = cameraObj.micDevId;
    const trf = cameraObj.trf.split("-");
    const type = trf[0];
    const resolution = trf[1];
    const fps = trf[2];
    const motionEnabled = cameraObj.motionEnabled;
    const soundClassEnabled = cameraObj.soundType === 'disabled' ? false: true;
    const isRecording = cameraObj.isRecording;

    
    let contentType = 'video/MP2T';
    console.log(slug);
    if(slug[1] === ('live.m3u8')) {
        contentType = 'application/vnd.apple.mpegURL';
        fileLoc = fileLoc.concat(camDevId, '-live.m3u8');
        updateStream({camDevId, resolution, fps, type, micDevId, motionEnabled, soundClassEnabled, isRecording});

    } else {fileLoc = homedir() + /.hc/ + slug[1];
        /*if(/^(\-){0,1}([0-9]{8})T([0-9]{6})(\+[0-9]{4}){0,1}\.mp4$/.test(slug[1].replaceAll(camDevId, ''))){
            fileLoc = homedir() + /.hc/ + slug[1];
            
        } else {
            fileLoc = fileLoc.concat(slug[1]);
            if(! /^(\-){0,1}([0-9]{8})T([0-9]{6})(\+[0-9]{4}){0,1}\.ts$/.test(slug[1].replaceAll(camDevId, '')))
                return new NextResponse("Forbidden!", {status: 403}); 
            */
            updateStream({camDevId, resolution, fps, type, micDevId, motionEnabled, soundClassEnabled, isRecording});
        //}
    }

    

    const dtrHeader = new Headers({
        'Content-Type': contentType
    });
    
    try { 
        await fs.promises.access(fileLoc, fs.constants.R_OK);
        const stats = await fs.promises.stat(fileLoc);
        const data = streamFile(fileLoc);
        
        const fileSize = stats.size;
        const rangeHeader = request.headers.get('Range');
        let dataStream: ReadableStream<Uint8Array>;
        
        let statusCode = 200;
        
        //HTTP Request Header에 range 존재 (206 Partial Content)
        if(rangeHeader) {
            const range = parseRangeHeader(rangeHeader, fileSize);
            statusCode = 206;
            const option = {start: range.start, end: range.end, highWaterMark: 60*1024};
            
            dataStream = streamFile(fileLoc, option);
            dtrHeader.set('Content-Range', `bytes ${range.start}-${range.end}/${fileSize}`);
        }
        
        //일반 다운로드 - 200 OK
        dtrHeader.set('Content-Length', fileSize.toString());
        
        const dtr = new NextResponse(data, {
            status: statusCode,
            headers: dtrHeader
        });
        return dtr;
        
    } catch(error: any) {
        if(error === '400')
        return new NextResponse('Bad Request', {status: 400});
        else if(error === '416')
        return new NextResponse('Range Not Satisfiable', {status: 416});
        else if(error.code == 'ENOENT')
        return new NextResponse('File not Found', {status: 404});
        else if (error.code == 'EACCESS')
        return new NextResponse('Access denied', {status: 403});
        else
        return new NextResponse("🫖", {status: 418});
    }
    
}