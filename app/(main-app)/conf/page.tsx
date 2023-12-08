export const dynamic = 'force-dynamic';
import CameraAddCard from "@/app/components/CameraAddCard";
import CameraConf from "@/app/components/CameraConf";
import { prisma } from "@/lib/prisma";

export default async function ConfPage() {
    const cameraInfos = await prisma.camera.findMany();
    return (
        <div className="flex flex-wrap justify-center gap-4 p-4">
            {
                cameraInfos.map((obj) => {
                    return <CameraConf key={obj.id} cameraId={obj.id} />
                })
            }
            <CameraAddCard />
        </div>
    );
}