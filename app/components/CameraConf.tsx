import { getAudioLists, getWebcamInfo, getWebcamsLists } from '@/lib/ffmpegCtrl';
import { prisma } from '@/lib/prisma';
import { CamOption } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface Props {
    cameraId: number;
}

export default async function CameraConf(prop:Props) {
    
    const cameraInfo = await prisma.camera.findFirst({where: {id: prop.cameraId}, include: {camOption: {}}});
    
    if (cameraInfo == null) {
        return (
            <div className="bg-white border rounded-lg shadow-lg p-4 responsive-panel">
                <h2 className="text-lg font-semibold mb-4">Error</h2>
                <p>An invalid webcam identifier was given</p>
                <div className="flex justify-end">
                    <Link href="/conf">
                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Go Back
                        </button>
                    </Link>
                </div>
            </div>
        )
    }
    
    const micList = await getAudioLists();

    async function saveConf(formData: FormData) {
        "use server";

        // Maybe not the best practice
        const camId: number = parseInt(formData.get('cameraId')?.toString()!);
        const name = formData.get('name')?.toString()!
        const motionEnabled = formData.get('motion') == 'enabled' ? true : false;
        const sdForm = formData.get('sound');
        let microphone = formData.get('microphone')?.toString();
        if(microphone == 'none') microphone = undefined;
        const resolution = formData.get('resolution')?.toString()!;
        console.log(camId);

        //TODO: resolution 필드 검증

        let soundType = 'disabled';
        if(sdForm == 'baby') {
            soundType = 'baby';
        } else if(sdForm == 'dog') {
            soundType = 'dog';
        }
        
        const camopt = cameraInfo?.camOption;

        const cre = await prisma.camera.update({
            where: { id: camId },
            data: {
                motionEnabled: motionEnabled,
                name: name,
                micDevId: microphone,
                soundType: soundType,
                trf: resolution,
            }
        });
        redirect('/')
        //revalidatePath(`/conf`);
    }

    

    return (
        <div className="bg-white border rounded-lg shadow-lg p-4 responsive-panel">
            <h2 className="text-lg font-semibold mb-4">Edit configuration for {cameraInfo.name}</h2>
            <form action={saveConf}>
                <input type="hidden" name="cameraId" value={prop.cameraId} />
                <div className="mb-4">
                    <label className="block mb-2">
                        Device Name
                    </label>
                    <input
                        type="text"
                        className="border rounded w-full p-2"
                        name="name"
                        defaultValue={cameraInfo.name}
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">
                        Default Resolution
                    </label>
                    <select name="resolution" className="border rounded w-full p-2">
                        {cameraInfo.camOption!.map((obj) => {
                            const optValue = obj.trf
                            const optStr = obj.trf
                            return <option value={optValue}>{optStr}</option>
                        })}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block mb-2">
                        Mapped Microphone
                    </label>
                    <select name="microphone" className="border rounded w-full p-2">
                        <option value="none">(Not selected)</option>
                        {
                            micList.map(e => {
                                if(e.micDevId == cameraInfo.micDevId) {return <option selected={true} value={e.micDevId}>{e.name}</option>}
                                return <option value={e.micDevId}>{e.name}</option>
                            })
                        }
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block mb-2">
                        Motion Detection
                    </label>
                    <select name="motion" className="border rounded w-full p-2">
                        <option value="disabled">Disabled</option>
                        <option value="enabled">Enabled</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block mb-2">
                        Sound Detection
                    </label>
                    <select name="sound" className="border rounded w-full p-2">
                        <option value="disabled">Disabled</option>
                        <option value="baby">Baby Crying</option>
                        <option value="dog">Dog Barking</option>
                        <option value="dog">Cat Meowing</option>
                    </select>
                </div>
                <div className="flex justify-end">
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2">
                        Delete
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type='submit'>
                        Save
                    </button>
                </div>
            </form>
        </div>
    )
}