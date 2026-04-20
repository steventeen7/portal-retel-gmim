import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

import { cookies } from 'next/headers'
import Layout from '@/components/Layout'
import { verifyToken } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Portal Persiapan RETEL GMIM — Media Pembelajaran Remaja Teladan',
  description: 'Portal resmi Media Pembelajaran Remaja untuk Pemilihan Remaja Teladan Sinode GMIM. Persiapkan diri Anda dengan materi, tes, dan panduan wawancara.',
  keywords: 'RETEL, GMIM, Remaja Teladan, Seleksi, Sinode GMIM',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const user = token ? verifyToken(token) : null

  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              fontSize: '0.9rem',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
        <Layout user={user}>{children}</Layout>
      </body>
    </html>
  )
}
