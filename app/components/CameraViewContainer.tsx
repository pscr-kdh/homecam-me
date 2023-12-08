import { prisma } from "@/lib/prisma"
import CamearViewCard from "./CameraViewCard";
import CameraAddCard from "./CameraAddCard";
export async function CamearViewContainer() {
    const cameras = await prisma.camera.findMany({
    });
    console.log(cameras);
    return (
        
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-custom gap-4">
                {
                    cameras.map((camera) => {
                        return <CamearViewCard key={camera.id} {...camera} />;
                    })
                }
                {
                    cameras.length == 0 ? <CameraAddCard /> : ''
                }
            </div>
    );

}
