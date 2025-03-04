'use client'
import useSWR from 'swr'
import React from 'react'
import { useRouter } from 'next/router'
import { SubmissionSummary } from '@/pages/api/leaderboard'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export default function Leaderboard({ btd6Map, gameType }: {
  btd6Map?: string
  gameType?: string
}) {
  const router = useRouter()
  const { data, error } = useSWR<SubmissionSummary[]>(
    `/api/leaderboard?${new URLSearchParams({
      ...(btd6Map && { btd6Map }),
      ...(gameType && { gameType })
    })}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  if (error) return <div className="error">Failed to load leaderboard</div>
  if (!data) return <div className="flex justify-center items-center p-10">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
  </div>

  // Sort by round (descending), then by creation date (ascending)
  data.sort((a, b) => {
    if (a.round != b.round) {
      if (a.round < b.round) return 1;
      return -1;
    }
    if (a.createdAt < b.createdAt) return -1;
    return 1;
  });

  const handleRowClick = (id: string) => {
    router.push(`/submissions/${id}`);
  };

  return (
    <div className="leaderboard-container">
      <table className="leaderboard-table">
        <thead className="leaderboard-header">
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Round</th>
            <th>Map</th>
            <th>Game Type</th>
            <th>Hero</th>
            <th>Upload Date</th>
          </tr>
        </thead>
        <tbody className="leaderboard-body">
          {data.map((submissionSum, index) => (
            <tr 
              key={submissionSum.submissionId} 
              className="leaderboard-row cursor-pointer hover:bg-blue-100"
              onClick={() => handleRowClick(submissionSum.submissionId)}
            >
              <td className={`rank-cell ${index < 3 ? 'top-rank' : ''}`}>
                #{index + 1}
              </td>
              <td className="player-cell">
                {submissionSum.user}
              </td>
              <td className="round-cell">
                {submissionSum.round}
              </td>
              <td className="leaderboard-cell">
                {submissionSum.btd6Map}
              </td>
              <td className="leaderboard-cell">
                {submissionSum.gameType}
              </td>
              <td className="leaderboard-cell">
                {submissionSum.heroNames.join(', ')}
              </td>
              <td className="leaderboard-cell">
                {formatDate(submissionSum.createdAt.toString())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}