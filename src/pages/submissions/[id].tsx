import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

import React, { useEffect, useState } from 'react';
import { SubmissionDetailed } from '../api/submissions/submission';

export default function SubmissionDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [submission, setSubmission] = useState<SubmissionDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchSubmission() {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch(`/api/submissions/submission?submissionId=${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch submission');
        }
        
        const data = await response.json();
        setSubmission(data);
      } catch (err) {
        setError("Error loading submission: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    }

    fetchSubmission();
  }, [id]);

  // Helper function to determine if media is embeddable
  const isEmbeddableVideo = (url?: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('twitch.tv') || 
           url.includes('vimeo.com');
  };

  // Helper function to convert YouTube/other video links to embed format
  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    
    // Convert YouTube URLs
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Convert youtu.be URLs
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Convert Twitch URLs (simplified, might need adjustment)
    if (url.includes('twitch.tv')) {
      const channelName = url.split('/').pop();
      return `https://player.twitch.tv/?channel=${channelName}&parent=${window.location.hostname}`;
    }
    
    // Convert Vimeo URLs
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  // Helper function to determine if media is an image
  const isImage = (url?: string) => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-4">Loading submission...</h1>
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg">
          <h1 className="text-2xl font-bold text-center mb-4">Error</h1>
          <p className="text-red-600 text-center">{error}</p>
          <div className="mt-6">
            <Link href="/submissions" className="block w-full p-3 bg-blue-600 text-white rounded-lg text-center text-lg font-medium hover:bg-blue-700 transition-all">
              Back to Submissions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg">
          <h1 className="text-2xl font-bold text-center mb-4">Submission Not Found</h1>
          <p className="text-center text-gray-700">The requested submission could not be found.</p>
          <div className="mt-6">
            <Link href="/submissions" className="block w-full p-3 bg-blue-600 text-white rounded-lg text-center text-lg font-medium hover:bg-blue-700 transition-all">
              Back to Submissions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header with Map and Round */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{submission.btd6Map.name}</h1>
            <div className="bg-white text-blue-700 px-4 py-2 rounded-lg text-xl font-bold">
              Round {submission.highestRound}
            </div>
          </div>
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {submission.user.image ? (
                <Image 
                  src={submission.user.image} 
                  alt={submission.user.name}
                  width={32}
                  height={32}
                  className="rounded-full mr-2"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center text-gray-600">
                  {submission.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium">{submission.user.name}</span>
            </div>
            <span className="mx-2">•</span>
            <span>{formatDate(submission.createdAt.toString())}</span>
            {submission.verified && (
              <>
                <span className="mx-2">•</span>
                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">Verified</span>
              </>
            )}
          </div>
        </div>

        {/* Media Section */}
        {submission.mediaLink && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Media</h2>
            {isEmbeddableVideo(submission.mediaLink) ? (
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <iframe 
                  src={getEmbedUrl(submission.mediaLink)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            ) : isImage(submission.mediaLink) ? (
              <div className="rounded-lg overflow-hidden">
                <Image 
                  src={submission.mediaLink} 
                  alt="Submission media" 
                  width={1000}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div>
                <a 
                  href={submission.mediaLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View Media Link
                </a>
              </div>
            )}
          </div>
        )}

        {/* Details Section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Game Details</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Map</p>
                  <p className="font-medium">{submission.btd6Map.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Game Type</p>
                  <p className="font-medium">{submission.gameType.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Heroes</p>
                  <p className="font-medium">{submission.heroes.map(hero => hero.name)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Highest Round</p>
                  <p className="font-medium">{submission.highestRound}</p>
                </div>
              </div>
            </div>
          </div>

          {submission.challenges.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Challenges</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {submission.challenges.map(challenge => (
                    <li key={challenge.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block mr-2 mb-2">
                      {challenge.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        {submission.additionalNotes && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="whitespace-pre-wrap">{submission.additionalNotes}</p>
            </div>
          </div>
        )}

        {/* File Downloads Section */}
        {(submission.screenshotPath || submission.saveFilePath) && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Files</h2>
            <div className="flex flex-wrap gap-3">
              {submission.screenshotPath && (
                <a 
                  href={submission.screenshotPath}
                  download
                  className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Screenshot
                </a>
              )}
              {submission.saveFilePath && (
                <a 
                  href={submission.saveFilePath}
                  download
                  className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Save File
                </a>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
          <Link href="/submissions" className="block p-3 bg-gray-200 text-gray-800 rounded-lg text-center text-lg font-medium hover:bg-gray-300 transition-all">
            Back to Submissions
          </Link>
          <Link href={`/leaderboard?btd6Map=${submission.btd6Map.id}&gameType=${submission.gameType.id}`} className="block p-3 bg-blue-600 text-white rounded-lg text-center text-lg font-medium hover:bg-blue-700 transition-all">
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}