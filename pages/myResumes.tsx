import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import HeaderMenu from '../components/HeaderMenu';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs';
import { format } from 'date-fns';

interface Resume {
  id: string;
  fileName: string;
  uploadDate: string;
  score: number;
  aiScore: number;
  analysis: string;
  thumbnailUrl?: string;
}

export default function MyResumes() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(10);
  
  const isClerkEnabled = process.env.NEXT_PUBLIC_CLERK_ENABLED === 'true';

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    // Fetch user's resumes from Azure storage
    const fetchResumes = async () => {
      try {
        const response = await fetch('/api/resumes/get-user-resumes');
        if (!response.ok) {
          throw new Error('Failed to fetch resumes');
        }
        const data = await response.json();
        setResumes(data.resumes || []);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResumes();
  }, [isLoaded, isSignedIn]);

  // Filter resumes based on score range
  const filteredResumes = resumes.filter(
    resume => resume.aiScore >= minScore && resume.aiScore <= maxScore
  );

  // Sort resumes based on selected criteria
  const sortedResumes = [...filteredResumes].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.uploadDate).getTime();
      const dateB = new Date(b.uploadDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' ? a.aiScore - b.aiScore : b.aiScore - a.aiScore;
    }
  });

  const handleViewResume = (resumeId: string) => {
    router.push(`/resume/${resumeId}`);
  };

  const handleDownloadPDF = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/download-pdf?resumeId=${resumeId}`);
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      // Create a blob from the PDF stream
      const blob = await response.blob();
      // Create a link to download it
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${resumeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const renderContent = () => (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              My Résumés
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Upload New Resume
              </button>
            </div>
          </div>
          
          {/* Filtering and Sorting Controls */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <label htmlFor="score-range" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Score ({minScore} - {maxScore})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    id="min-score"
                    min="0"
                    max="10"
                    step="1"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{minScore}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="range"
                    id="max-score"
                    min="0"
                    max="10"
                    step="1"
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{maxScore}</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  >
                    <option value="date">Upload Date</option>
                    <option value="score">Score</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    aria-label="Toggle sort order"
                  >
                    {sortOrder === 'asc' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading your résumés...</p>
            </div>
          ) : sortedResumes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedResumes.map((resume) => (
                <div 
                  key={resume.id} 
                  className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate max-w-xs">
                        {resume.fileName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Uploaded on {new Date(resume.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Score: {resume.aiScore}/10
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                        Humiliation: {resume.score}%
                      </span>
                    </div>
                  </div>
                  
                  {resume.thumbnailUrl && (
                    <div className="mb-4 bg-white p-2 border border-gray-200 rounded">
                      <img 
                        src={resume.thumbnailUrl} 
                        alt="Resume preview" 
                        className="w-full h-32 object-contain"
                      />
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Key Feedback:</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {resume.analysis}
                    </p>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => handleViewResume(resume.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-800 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(resume.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-600">No résumés found. Upload your first résumé to get started.</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Upload Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Head>
        <title>My Résumés - HumbleMePlz</title>
        <meta name="description" content="View all your uploaded résumés and their analysis" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <HeaderMenu />
      
      {isClerkEnabled ? (
        <>
          <SignedIn>
            {renderContent()}
          </SignedIn>
          
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      ) : (
        renderContent()
      )}
    </div>
  );
}