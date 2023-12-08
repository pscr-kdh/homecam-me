export const dynamic = 'force-dynamic'
import { getRecordedVideoList } from '@/lib/ffmpegCtrl'
import Link from 'next/link'
export default async function RecordingsListPage() {
    const videoList = await getRecordedVideoList()
    return (
        <>
            <div className="bg-white shadow-md rounded p-6 w-full ">
                <h2 className="font-semibold text-lg mb-4">Recordings</h2>
                <div className="mb-4">
                    <label htmlFor="date-from-2" className="sr-only">
                        From
                    </label>
                    <input type="date" id="date-from-2" className="mr-2" />
                    <label htmlFor="date-to-2" className="sr-only">
                        To
                    </label>
                    <input type="date" id="date-to-2" />
                    <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">
                        Search
                    </button>
                </div>
                <div id="file-list-2">
                    {videoList.map((o) => {
                        return (
                            <div
                                id="file-201"
                                className="border-b-2 py-2 flex justify-between items-center"
                            >
                                <Link href={'/api/livestream/4/' + o}>
                                    <span>{o}</span>
                                </Link>
                                <div>
                                    <Link href={'/rec/share/' + o}>
                                        <button className="text-blue-500 hover:underline mr-2">
                                            Share
                                        </button>
                                    </Link>
                                    <button className="text-red-500 hover:underline">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}
