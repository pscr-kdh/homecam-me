export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import "../globals.css";
import { HeaderMenuProvider } from "./HeaderMenuProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

//const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: "HomeCam.me",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    //Require Login to access
    const session = await getServerSession(authOptions);
    if (!session) {
        if ((await prisma.user.count({ where: { isAdmin: true } })) == 0)
            redirect("/init-setup");
        redirect("/api/auth/signin");
    }
    const cameras = await prisma.camera.findMany();

    return (
        <html lang="en">
            <body className="flex flex-col h-screen">
                <main className="flex flex-1 overflow-hidden pt-16">
                    <HeaderMenuProvider cameras={cameras} />
                    <main className="flex-1 p-6 overflow-auto">{children}</main>
                </main>
            </body>
        </html>
    );
}
