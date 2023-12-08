
import Link from "next/link";
import SideBarCameraItem from "./SideBarCameraItem";
import { Camera } from "@prisma/client";
import { v4 } from "uuid";
interface Props {
    isOpen: boolean;
    cameras: Camera[];
}
export default function SideBar({ isOpen, cameras }: Props) {
    const sideBarStyle = {
        display: isOpen ? "block" : "none",
    };


    return (
        <nav
            className="sidebar bg-white w-64 p-6 hidden sm:block"
            style={sideBarStyle}
        >
            <Link href='/'><div className="text-lg rounded-md py-1 px-3 hover:bg-gray-100 transition-colors cursor-pointer">
                📷 Cameras
            </div></Link>
            <ul className="mb-4">
                {cameras.map((camera) => {
                    return <SideBarCameraItem key={v4()} id={camera.id.toString()} name={camera.name} />
                })}
            </ul>
            <Link href='/rec'><div className="text-lg rounded-md py-1 px-3 hover:bg-gray-100 transition-colors cursor-pointer">
                📼 Saved Videos
            </div></Link>
            <Link href='/conf'><div className="text-lg rounded-md py-1 px-3 hover:bg-gray-100 transition-colors cursor-pointer">
                ⚙️ Configuration
            </div></Link>
        </nav>
    );
}
