export const dynamic = 'force-dynamic';
import type { Metadata } from 'next'
import '../globals.css'

//const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Setup HomeCam.me',
}

export default function InitSetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 flex items-center justify-center h-screen">
        <main className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
