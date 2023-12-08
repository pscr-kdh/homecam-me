export const dynamic = 'force-dynamic';
import { getAudioLists, getWebcamInfo, getWebcamsLists } from '@/lib/ffmpegCtrl';
import { prisma } from '@/lib/prisma';
import { CamOption } from '@prisma/client';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AddCameraSecondPage({
    params,
}: {
    params: { slug: string }
}) {
    const wcList = await getWebcamsLists();
    if (! (wcList?.includes(params.slug))) {
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

    const tr = await prisma.camera.findFirst({
        where: { camDevId: params.slug },
    });

    // 시스템에 이미 등록된 웹캠
    if (!(tr === null)) {
        return (
            <div className="bg-white border rounded-lg shadow-lg p-4 responsive-panel">
                <h2 className="text-lg font-semibold mb-4">Error</h2>
                <p>This webcam is already being controlled by the system</p>
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
    
    const cameraOptions = await getWebcamInfo(params.slug);
    const micList = await getAudioLists();

    async function saveConf(formData: FormData) {
        "use server";
        console.log(formData);
        const cameraOptions = await getWebcamInfo(params.slug);

        // Maybe not the best practice
        const devId: string = formData.get('devId')?.toString()!;
        const name = formData.get('name')?.toString()!
        const motionEnabled = formData.get('motion') == 'enabled' ? true : false;
        const sdForm = formData.get('sound');
        const resolution = formData.get('resolution')?.toString()!;

        //TODO: resolution 필드 검증

        let soundType = 'disabled';
        if(sdForm == 'baby') {
            soundType = 'baby';
        } else if(sdForm == 'dog') {
            soundType = 'dog';
        }
        console.log(cameraOptions);
        
        let camopt: {type:string, resolution:string, fps:string}[] = [];
        cameraOptions?.forEach((opt) => {
            const tmp = {type: opt.type, resolution: opt.resolution, fps: opt.fps};
            camopt.push(tmp);
        });


        const cre = await prisma.camera.create({
            data: {
                camDevId: devId,
                isRecording: false,
                motionEnabled: motionEnabled,
                name: name,
                soundType: soundType,
                trf: resolution,
                camOption: {
                    create: 
                        cameraOptions?.map(obj => ({
                            trf: ''.concat(obj.type, '-', obj.resolution, '-', obj.fps)
                        }))
                    
                }
            }
        });
        redirect(`/conf`);
    }

    

    return (
        <div className="bg-white border rounded-lg shadow-lg p-4 responsive-panel">
            <h2 className="text-lg font-semibold mb-4">Add new camera</h2>
            <form action={saveConf}>
                <input type="hidden" name="devId" value={params.slug} />
                <div className="mb-4">
                    <label className="block mb-2">
                        Device Name
                    </label>
                    <input
                        type="text"
                        className="border rounded w-full p-2"
                        name="name"
                        defaultValue={params.slug}
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">
                        Default Resolution
                    </label>
                    <select name="resolution" className="border rounded w-full p-2">
                        {cameraOptions!.map((obj) => {
                            const optValue = ''.concat(obj.type, '-', obj.resolution, '-', obj.fps)
                            const optStr = ''.concat(obj.type, ', ', 'Resolution: ',  obj.resolution, ', ', obj.fps, 'fps')
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
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type='submit'>
                        Save
                    </button>
                </div>
            </form>
        </div>
    )
}
