'use client'
import { ReactNode } from 'react'
import AppBar from './AppBar'
import React from 'react'
import '../styles/globals.css'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <AppBar />
      <main className="flex-grow p-4 sm:p-8">
        {children}
      </main>
    </div>
  )
}