import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

export default function UserProfile() {
  const router = useRouter()
  console.log(router, router.query)
  const { id } = router.query
  const { data: session } = useSession()

  console.log("a2", router, router.query)
  return (
    <>
      <div className="max-w-4xl mx-auto card">
        <div className="flex items-center gap-6 mb-8">
          <img 
            src={session?.user?.image || '/default-avatar.png'} 
            className="w-24 h-24 rounded-full"
            alt="Profile"
          />
          <div>
            <h1 className="text-3xl font-bold">{session?.user?.name}</h1>
            <p className="text-gray-600">{session?.user?.email}</p>
            {session?.user?.id === id && (
              <Link href="/user/edit" className="btn-primary mt-4 inline-block">
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Recent Submissions</h2>
        <div className="space-y-4">
          {/* Add submission list component here */}
        </div>
      </div>
    </>
  )
}