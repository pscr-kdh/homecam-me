import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
    id: string;
    name: string;
}
export default function SideBarCameraItem({ id, name }: Props) {
    const notSelectedStyle = "hover:bg-blue-100 py-1 px-3 rounded-md transition-colors";
    const selectedStyle = "bg-blue-500 py-1 px-3 text-white rounded-md";
    const pathname = usePathname();

    return (
        <Link key={`Link-${id}`} href={`/camera/${id}`}>
            <li key={id} className={(pathname == '/camera/' + id) ? selectedStyle : notSelectedStyle}>
                - {name}
            </li>
        </Link>
    );
}
