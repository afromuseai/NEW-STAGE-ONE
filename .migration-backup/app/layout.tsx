import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: 'STAGEONE | AI Business Operating System',
  description: 'Build and scale businesses with AI intelligence. Generate business analysis, growth strategies, website structures, chatbot designs, and automation plans.',
  keywords: ['AI', 'Business', 'Automation', 'Strategy', 'SaaS', 'Operating System'],
  authors: [{ name: 'STAGEONE' }],
  creator: 'STAGEONE',
  openGraph: {
    title: 'STAGEONE | AI Business Operating System',
    description: 'Build and scale businesses with AI intelligence.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STAGEONE | AI Business Operating System',
    description: 'Build and scale businesses with AI intelligence.',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
