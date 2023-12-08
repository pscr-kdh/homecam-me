// GET /api/cameras/raw/(camera-dev-id): 카메라의 devid를 받아 해당 카메라가 지원하는 해상도와 프레임의 목록을 반환
export const dynamic = 'force-dynamic';

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getWebcamInfo, getWebcamsLists } from "@/lib/ffmpegCtrl";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: {params: {slug: string[]}}): Promise<NextResponse> {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse('Forbidden', {status: 403});
    }

    // GET /api/cameras/raw: 실제 서버에 연결되어 있는 카메라의 dev id 목록을 JSON으로 반환
    if(context.params.slug == undefined) {
        const cameraList = await getWebcamsLists();
        return NextResponse.json(cameraList);    
    }
    const cameraList = await getWebcamsLists();
    if(! cameraList?.includes(context.params.slug[0]))
        return new NextResponse("Camera Not found", {status: 404});
    
    const camera = await getWebcamInfo(context.params.slug[0]);
    
    camera?.forEach(element => {
        
    });

    return NextResponse.json(camera);
}