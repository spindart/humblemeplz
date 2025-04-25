import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import HeaderMenu from '../components/HeaderMenu';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs';

interface Tip {
  category: string;
  tips: string[];
}

interface TipsResponse {
  tips: Tip[];
  source: 'ai' | 'mock';
}

export default function MyTips() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [tips, setTips] = useState<Tip[]>([]);
  const [source, setSource] = useState<'ai' | 'mock'>('ai');
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  
  const isClerkEnabled = process.env.NEXT_PUBLIC_CLERK_ENABLED === 'true';

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    // Fetch personalized tips for the user
    fetch('/api/get-tips?sessionId=latest')
      .then(res => res.json())
      .then((data: TipsResponse) => {
        if (data.tips) {
          setTips(data.tips);
          setSource(data.source);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [isLoaded, isSignedIn]);

  const handleConvertToTasks = async () => {
    if (!tips.length) return;
    
    try {
      setConverting(true);
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
        router.push('/myTasks');
      }
    } catch (error) {
      console.error('Error converting tips to tasks:', error);
      alert('Failed to convert tips to tasks. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  const renderContent = () => (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              My Resume Improvement Tips
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleConvertToTasks}
                disabled={converting || !tips.length}
                className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {converting ? "Converting..." : "Convert to Tasks"}
              </button>
              <button
                onClick={() => router.push('/myTasks')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                View My Tasks
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading your personalized tips...</p>
            </div>
          ) : tips.length > 0 ? (
            <div className="space-y-8">
              {tips.map((category, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-800 text-white rounded-full flex items-center justify-center mr-3 text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    {category.category}
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No tips available. Please analyze your resume first.</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Analyze Resume
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
        <title>My Tips - HumbleMePlz</title>
        <meta name="description" content="View your personalized resume improvement tips" />
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
