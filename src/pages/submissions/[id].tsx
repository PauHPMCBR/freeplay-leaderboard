import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

import React, { useEffect, useState } from 'react';
import { SubmissionDetailed } from '../api/submissions/[id]';
import { useSession } from 'next-auth/react';
import SubmissionVerifyForm from '@/components/SubmissionVerifyForm';

export default function SubmissionDetails() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id, verifierEdit } = router.query;
  console.log("test2", id);
  const [submission, setSubmission] = useState<SubmissionDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopCount, setShowPopCount] = useState(false);
  const [popCountData, setPopCountData] = useState<Array<{towerType: string, popCount: number}>>([]);
  const [popCountLoading, setPopCountLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchSubmission() {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch(`/api/submissions/${id}`);
        
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

  // Function to load pop count data when toggled
  const loadPopCountData = async () => {
    if (!submission?.popcountFilePath) return;
    
    try {
      setPopCountLoading(true);
      const response = await fetch(`/${submission.popcountFilePath}`);
      
      if (!response.ok) {
        throw new Error('Failed to load pop count data');
      }
      
      const csvText = await response.text();
      
      // Parse CSV
      const rows = csvText.split('\n');
      
      const data = rows.slice(1)
        .filter(row => row.trim() !== '')
        .map(row => {
          const values = row.split(',');
          return {
            towerType: values[0],
            popCount: parseInt(values[1], 10)
          };
        });
      
      setPopCountData(data);
    } catch (err) {
      console.error("Error loading pop count data:", err);
      setPopCountData([]);
    } finally {
      setPopCountLoading(false);
    }
  };

  // Toggle pop count display and load data if needed
  const togglePopCount = () => {
    if (!showPopCount && popCountData.length === 0) {
      loadPopCountData();
    }
    setShowPopCount(!showPopCount);
  };

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

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
            <Link href={`/user/${submission.user.id}`} className="flex items-center" >
              {submission.user.image ? (
                <img 
                  src={`/${submission.user.image}`}
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
            </Link>
            <span className="mx-2">•</span>
            <span>{formatDate(submission.createdAt.toString())}</span>
            {submission.verified ? (
              <>
                <span className="mx-2">•</span>
                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">Verified</span>
              </>
            ) : (
              <>
                <span className="mx-2">•</span>
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">Not Verified</span>
              </>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 grid grid-cols-1 gap-6">
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
                  <p className="text-sm text-gray-500">Game Version</p>
                  <p className="font-medium">v{submission.version}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Players</p>
                  <p className="font-medium">{submission.players}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Highest Round</p>
                  <p className="font-medium">{submission.highestRound}</p>
                </div>
                {submission.seed && (
                  <div>
                    <p className="text-sm text-gray-500">Seed</p>
                    <p className="font-medium">{submission.seed}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="font-medium">{formatDate(submission.createdAt.toString())}</p>
                </div>

                {/* Heroes display */}
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Heroes</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {submission.heroes.map(hero => (
                      <span 
                        key={hero.id}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {hero.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Challenges display */}
                {submission.challenges.length > 0 && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Challenges</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {submission.challenges.map(challenge => (
                      <span 
                        key={challenge.id}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {challenge.name}
                      </span>
                    ))}
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Media Section */}
        {(submission.mediaLink || submission.screenshotPath) && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Media Evidence</h2>

            {/* External Media Link */}
            {submission.screenshotPath && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Screenshot</h3>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={`/${submission.screenshotPath.replaceAll('\\', '/')}`}
                    alt="Game screenshot proof"
                    fill
                    className="object-contain"
                    quality={90}
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
              </div>
            )}

            {/* Video Embed */}
            {submission.mediaLink && (
              <div className="mt-6">
                {isEmbeddableVideo(submission.mediaLink) ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <iframe 
                      src={getEmbedUrl(submission.mediaLink)}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Video proof embed"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                ) : isImage(submission.mediaLink) ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={submission.mediaLink}
                      alt="Additional media proof"
                      fill
                      className="object-contain"
                      quality={90}
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <a 
                      href={submission.mediaLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View External Media Proof
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pop Count Section */}
        {submission.popcountFilePath && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tower Pop Counts</h2>
              <button 
                onClick={togglePopCount}
                className="flex items-center font-medium"
              >
                {showPopCount ? (
                  <>
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Hide Pop Counts
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show Pop Counts
                  </>
                )}
              </button>
            </div>
            
            {showPopCount && (
              <div className="bg-gray-50 rounded-lg p-4 animate-fadeIn">
                {popCountLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : popCountData.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left p-2 font-semibold">Tower Type</th>
                            <th className="text-right p-2 font-semibold">Pop Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {popCountData.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-2 border-t border-gray-200">{item.towerType}</td>
                              <td className="p-2 text-right border-t border-gray-200">{formatNumber(item.popCount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      <a 
                        href={`/${submission.popcountFilePath}`}
                        download
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download full CSV
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600 py-4 text-center">Failed to load pop count data.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notes Section */}
        {submission.additionalNotes && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="whitespace-pre-wrap">{submission.additionalNotes}</p>
            </div>
          </div>
        )}

        {/* Verifier Notes Section */}
        {(verifierEdit && session?.user.verifier) ? (
          <SubmissionVerifyForm submissionId={submission.submissionId}>
            
          </SubmissionVerifyForm>
        ) : (submission.additionalVerifierNotes && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Verifier Notes</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="whitespace-pre-wrap">{submission.additionalVerifierNotes}</p>
            </div>
          </div>
        ))}

        {/* File Downloads Section */}
        {(submission.saveFilePath) && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Files</h2>
            <div className="flex flex-wrap gap-3">              
              {submission.saveFilePath && (
                <a 
                  href={`/${submission.saveFilePath}`}
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
          <Link href={`/leaderboard?btd6Map=${submission.btd6Map.id}&gameType=${submission.gameType.id}`} className="block p-3 bg-blue-600 text-white rounded-lg text-center text-lg font-medium hover:bg-blue-700 transition-all">
            View in Leaderboard
          </Link>
          {session?.user.verifier && (
          <Link href={`/submissions/${id}?verifierEdit=true`} className="block p-3 bg-blue-600 text-white rounded-lg text-center text-lg font-medium hover:bg-blue-700 transition-all">
            Edit verification
          </Link>
          )}
        </div>
      </div>
    </div>
  );
}
