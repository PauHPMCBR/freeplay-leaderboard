// pages/admin/dashboard.tsx
import AdminGuard from '@/components/AdminGuard'
import useSWR from 'swr'
import { User } from '@prisma/client'
import React from 'react'
import DatabaseViewer from '@/components/DatabaseViewer'
import { useSession } from 'next-auth/react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AdminDashboard() {
  const { data: session } = useSession()
  
  const { data: users, mutate } = useSWR<User[]>('/api/admin/users', fetcher, {
    refreshInterval: 5000
  })

  const handleRoleUpdate = async (userId: string, role: 'admin' | 'verifier', value: boolean) => {
    try {
      await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, [role]: value })
      })
      mutate()
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* User Management Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Admin</th>
                  <th className="px-6 py-3 text-left">Verifier</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users?.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={`/${user.image}`}
                          className="w-8 h-8 rounded-full mr-2"
                          alt="Avatar"
                        />
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={user.admin}
                        onChange={(e) => handleRoleUpdate(user.id, 'admin', e.target.checked)}
                        className="h-4 w-4"
                        disabled={user.id === session?.user.id}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={user.verifier}
                        onChange={(e) => handleRoleUpdate(user.id, 'verifier', e.target.checked)}
                        className="h-4 w-4"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Database Visualization Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Database Viewer</h2>
          <DatabaseViewer />
        </section>
      </div>
    </AdminGuard>
  )
}