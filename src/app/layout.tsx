import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'
import '@/styles/phh-design-system.css'
import '@/styles/directory-layout.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-heading',
})

const openSansBody = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Employee Directory | Paradigm Home Health',
  description: 'Internal employee directory for Paradigm Home Health',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${openSans.variable} ${openSansBody.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
