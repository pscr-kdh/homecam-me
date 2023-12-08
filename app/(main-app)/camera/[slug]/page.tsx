export const dynamic = 'force-dynamic';
import CameraConf from "@/app/components/CameraConf";
import CameraViewCard from "@/app/components/CameraViewCard";
import VoiceRecorderButton from "@/app/components/RecordingButton";
import { prisma } from "@/lib/prisma";


export default async function CameraDetailPage(context: {params: {slug: string}}) {
    const id = parseInt(context.params.slug);
    const camera = await prisma.camera.findFirst({where: {id: id}});

    return (
        <>
        <CameraViewCard key={id} {...camera!} />
        <CameraConf cameraId={id} />
        <VoiceRecorderButton key={id + 'voice'} />
        </>
    );

}