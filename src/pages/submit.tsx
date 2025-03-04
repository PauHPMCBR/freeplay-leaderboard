import SubmissionForm from '@/components/SubmissionForm'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React from 'react';

export default function SubmitPage() {
  const { status } = useSession()
  const router = useRouter()

  if (status === 'unauthenticated') {
    router.push('/')
    return null
  }

  return (
    <>
      <div className="max-w-2xl mx-auto card">
        <h1 className="text-3xl font-bold mb-6">Submit New Run</h1>
        <SubmissionForm />
      </div>
    </>
  )
}