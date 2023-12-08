export const dynamic = 'force-dynamic';
import { getWebcamsLists } from "@/lib/ffmpegCtrl";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AddCameraFirstPage() {

    const connectedCameraList = await getWebcamsLists();

    async function goNext(formData:FormData) {
        "use server";
        const camname= formData.get('cameraList');
        redirect(`/conf/add-camera/step2/${camname}`);
    }

    return(
        <div className="flex flex-wrap justify-center gap-4 p-4">
            <div className="bg-white border rounded-lg shadow-lg p-4 responsive-panel">
                <h2 className="text-lg font-semibold mb-4">Add new camera</h2>
                <form action={goNext}>
                    <div className="mb-4">
                        
                        <label htmlFor="resolution-1" className="block mb-2">Please select your webcam to add to Homecam.me</label>
                        
                        <select id="resolution-1" name="cameraList" className="border rounded w-full p-2">
                            {
                                connectedCameraList!.map((obj)=> {
                                    return <option value={obj}>{obj}</option>;
                                })
                            }
                        </select>
                    </div>
                    <div className="flex justify-end">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">Next</button>
                    </div>
                </form>
            </div>
        </div>
    );
}