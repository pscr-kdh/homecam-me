import Link from "next/link";

interface Props {
  toggleSidebar: () => void;
}
export default function Header({toggleSidebar}: Props) {

    return (
        <header className="header bg-white shadow-md p-3 flex justify-between items-center fixed w-full top-0">
        <button className="menu-btn p-2 rounded-md border border-gray-200 mr-4 px-5" onClick={toggleSidebar}>☰</button>
        <span className="text-lg font-bold">HomeCam.me</span>
        <Link href='/api/auth/signout'><button className="logout-btn bg-red-500 text-white p-2 rounded-md border border-gray-200">Logout</button></Link>
      </header>
    );
}