import { User } from '@prisma/client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { SubmissionSummary } from '../api/submissions/list'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())
  
export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  // Fetch user data with SWR
  const { data: user, error: userError } = useSWR<User>(
    id ? `/api/user/${id}` : null,
    fetcher
  );

  // Fetch submissions with SWR
  const { data: submissions, error: submissionsError } = useSWR<SubmissionSummary[]>(
    id ? `/api/submissions/list?${new URLSearchParams({
      user: id as string,
      start: '1',
      end: '20',
      orderBy: 'createdat',
      ascOrder: 'false'
    })}` : null,
    fetcher,
    { refreshInterval: 30000 } //?
  );

  const loading = (!user && !userError) || (!submissions && !submissionsError);
  const error = userError || submissionsError;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg">
          <h1 className="text-2xl font-bold text-center mb-4">Loading</h1>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg">
          <h1 className="text-2xl font-bold text-center mb-4">Error</h1>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
<div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="relative">
          <img
            src={user.image ? `/${user.image}` : '/DartMonkey.png'}
            width={96}
            height={96}
            className="rounded-full w-24 h-24 border-2 border-gray-200"
            alt="Profile"
          />
          {session?.user?.id === user.id && (
            <Link href="/user/edit" className="absolute -bottom-2 right-0">
              <button className="p-1.5 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </Link>
          )}
        </div>
        
        <div className="flex-1">

          <div className="flex items-center mt-2">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          {!user.realUser && (
            <>
              <span className="mx-2"> </span>
              <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">Artificial User</span>
            </>
          )}
          {user.verifier && (
            <>
              <span className="mx-2"> </span>
              <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">Verifier</span>
            </>
          )}
          </div>
          
          {/* Social Links */}
          {(user.youtubeChannel || user.discordId) && (
            <div className="flex gap-4 mt-4">
              {user.youtubeChannel && (
                <a
                  href={user.youtubeChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  YouTube
                </a>
              )}
              {user.discordId && (
                <div className="flex items-center text-indigo-600">
                  <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
                  </svg>
                  {user.discordId}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      {user.additionalNotes && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">User Notes</h2>
          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap border border-gray-200">
            {user.additionalNotes}
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold mb-6">Recent Submissions</h2>
        {submissions && submissions.length > 0 ? (
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <Link
                key={submission.submissionId}
                href={`/submissions/${submission.submissionId}`}
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">
                      {submission.btd6Map} - {submission.gameType}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Round {submission.round} • {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {submission.verified && (
                    <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-sm">
                      Verified
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No submissions yet
          </div>
        )}
      </div>
    </div>
  )
}