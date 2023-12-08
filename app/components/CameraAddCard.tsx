import Link from "next/link";

export default function CameraAddCard() {
    return (
        <div className="border p-4 flex flex-col bg-white rounded-lg shadow items-center justify-center">
            <div className="font-bold flex justify-between w-full p-1">
                <span>Do you want to add some cameras?</span>
            </div>
            <div className="aspect-ratio-16-9">
                <div className="react-player-wrapper bg-gray-300 flex items-center justify-center"></div>
                <Link href="/conf/add-camera">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center text-white px-5 py-2.5 text-sm bg-blue-700 rounded-lg hover:bg-blue-800"
                    >
                        <svg
                            className="w-5 h-5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="4 0 14 10"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M1 5h12m0 0L9 1m4 4L9 9"
                            />
                        </svg>
                        Add new camera...
                    </button>
                </Link>
            </div>
        </div>
    );
}
