// components/AdminGuard.tsx
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import Loading from './Loading'
import React from 'react'

export default function AdminGuard({ children }: { children: ReactNode}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">
      <Loading />
    </div>
  }

  if (!session?.user?.admin) {
    router.push('/')
    return null
  }

  return children
}