import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import React from 'react'

export default function EditProfile() {
  const { data: session, update } = useSession()
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: session?.user?.name || ''
    }
  })

  const onSubmit = async (data: { name: string }) => {
    await fetch('/api/user/update', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    await update({ name: data.name })
  }

  return (
    <>
      <div className="max-w-2xl mx-auto card">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              {...register('name')}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </form>
      </div>
    </>
  )
}