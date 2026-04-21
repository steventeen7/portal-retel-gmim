import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

import { cookies } from 'next/headers'
import Layout from '@/components/Layout'
import { verifyToken } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Latihan RETEL GMIM — Media Pembelajaran Remaja Teladan',
  description: 'Aplikasi Latihan resmi Media Pembelajaran Remaja untuk Pemilihan Remaja Teladan Sinode GMIM.',
  keywords: 'Latihan, RETEL, GMIM, Remaja Teladan, Seleksi, Sinode GMIM',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Latihan RETEL',
  },
  formatDetection: {
    telephone: false,
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const user = token ? await verifyToken(token) : null

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
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
