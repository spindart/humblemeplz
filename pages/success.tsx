import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import HeaderMenu from '../components/HeaderMenu';

interface Tip {
  category: string;
  tips: string[];
}

interface TipsResponse {
  tips: Tip[];
  source: 'ai' | 'mock';
}

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [tips, setTips] = useState<Tip[]>([]);
  const [source, setSource] = useState<'ai' | 'mock'>('ai');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [convertingToTasks, setConvertingToTasks] = useState(false);
  const [tasksCreated, setTasksCreated] = useState(false);
  
  // Check if Clerk is enabled from environment variable
  const isClerkEnabled = process.env.NEXT_PUBLIC_CLERK_ENABLED === 'true';

  useEffect(() => {
    if (!router.isReady) return;
    
    if (session_id) {
      // Fetch personalized tips based on the session
      fetch(`/api/get-tips?sessionId=${session_id}`)
        .then(res => res.json())
        .then((data: TipsResponse) => {
          if (data.tips) {
            setTips(data.tips);
            setSource(data.source);
            
            // Automatically convert tips to tasks
            convertTipsToTasks(data.tips);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error(error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [router.isReady, session_id]);

  const convertTipsToTasks = async (tipsData: Tip[]) => {
    try {
      setConvertingToTasks(true);
      const response = await fetch('/api/kanban/convert-tips-to-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tips: tipsData }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert tips to tasks');
      }

      const result = await response.json();
      if (result.success) {
        setTasksCreated(true);
      }
    } catch (error) {
      console.error('Error converting tips to tasks:', error);
    } finally {
      setConvertingToTasks(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tips }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create a blob from the PDF stream
      const blob = await response.blob();
      // Create a link to download it
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume-improvement-plan.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleConvertToTasks = async () => {
    if (!tips.length) return;

    try {
      setConvertingToTasks(true);
      const response = await fetch('/api/kanban/convert-tips-to-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tips }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert tips to tasks');
      }

      const result = await response.json();
      if (result.success) {
        router.push('/myTasks?refresh=true');
      }
    } catch (error) {
      console.error('Error converting tips to tasks:', error);
      alert('Failed to convert tips to tasks. Please try again.');
    } finally {
      setConvertingToTasks(false);
    }
  };

  // Render content without Clerk authentication when disabled
  const renderContent = () => (
    <main className="container mx-auto px-4 py-4 sm:py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 transition-all duration-300 opacity-100 transform translate-y-0">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-500 ease-out">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Thank You!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Your payment has been processed successfully.
            </p>
            {tasksCreated && (
              <div className="mt-2 text-green-600 text-sm">
                Your tips have been converted to tasks! <a href="/myTasks" className="underline">View your tasks</a>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading your personalized tips...</p>
            </div>
          ) : tips.length > 0 ? (
            <div className="prose max-w-none">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 m-0">
                  Your Personalized Improvement Plan
                </h2>
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center md:justify-end">
                  {source === 'ai' ? (
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Generated
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Expert Tips
                    </span>
                  )}
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-800 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                  >
                    {downloading ? "Generating PDF..." : "Download PDF"}
                  </button>
                  <button
                    onClick={() => router.push('/myTasks')}
                    className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    View Tasks
                  </button>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-8">
                {tips.map((category, index) => (
                  <div 
                    key={index} 
                    className={`bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow ${
                      category.category === "Current Strengths" ? "border-l-4 border-l-green-500" : ""
                    }`}
                  >
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 bg-red-800 text-white rounded-full flex items-center justify-center mr-2 sm:mr-3 text-xs sm:text-sm flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="break-words">{category.category}</span>
                      {category.category === "Current Strengths" && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Strengths</span>
                      )}
                    </h3>
                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-sm sm:text-base">
                      {category.tips && Array.isArray(category.tips) ? (
                        category.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-gray-700">
                            {tip}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-700">No tips available</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No tips available. Please try again later.</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 sm:mt-10 text-center">
            <button
              onClick={() => router.push('/')}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-red-800 text-white rounded-full hover:bg-red-700 transition-colors flex items-center mx-auto text-sm sm:text-base hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              Analyze Another Resume
            </button>
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Head>
        <title>Thank You! - HumbleMePlz.com</title>
        <meta name="description" content="Your personalized resume improvement tips" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content="Thank You! - HumbleMePlz.com" />
        <meta property="og:description" content="Your personalized resume improvement plan is ready." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://humblemeplz.com/success" />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Thank You! - HumbleMePlz.com" />
        <meta name="twitter:description" content="Your personalized resume improvement plan is ready." />
        <meta name="twitter:image" content="/twitter-image.jpg" />
        
        {/* Favicon Tags */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#991b1b" />
        <meta name="msapplication-TileColor" content="#991b1b" />
        <meta name="theme-color" content="#ffffff" />
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
        // Render content directly without authentication when Clerk is disabled
        renderContent()
      )}
    </div>
  );
}