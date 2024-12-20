// src/app/layout.tsx
import { Inter } from 'next/font/google'
import './globals.css' // if using Tailwind

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Solana Game of Life',
  description: 'Visualizing Solana transactions using Conway\'s Game of Life',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}