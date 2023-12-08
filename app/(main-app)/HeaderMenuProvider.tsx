"use client";
import Image from 'next/image'
import Header from './Header';
import SideBar from './SideBar';
import { useState } from "react";
import { Camera } from '@prisma/client';

interface Props {
    cameras: Camera[];
}
export function HeaderMenuProvider({cameras}: Props) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };
  
    return (
        <>
            <Header toggleSidebar={toggleSidebar} />
            <div className="flex overflow-hidden">
            <SideBar isOpen={isSidebarOpen} cameras={cameras}/>
            </div>
        </>
    );
}