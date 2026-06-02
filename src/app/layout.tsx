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

// Runs before React hydrates: reads the persisted theme and applies it to
// <html> so the page doesn't flash light-then-dark on first paint.
const themeInitScript = `
(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${openSans.variable} ${openSansBody.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
