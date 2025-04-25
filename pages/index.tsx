import { useState } from 'react';
import Head from 'next/head';
import { FileUploader } from '../components/FileUploader';
import { Analysis } from '../components/Analysis';
import { PaymentModal } from '../components/PaymentModal';
import { useAuth, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import HeaderMenu from "../components/HeaderMenu";

interface AnalysisResponse {
  analysis: string;
  score: number;
  aiScore: number;
  sessionId?: string;
}

export default function Home() {
  const [pdfText, setPdfText] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);

  const handleFileUpload = async (analysisResponse: AnalysisResponse, file: File) => {
    setIsLoading(true);
    try {
      setFileName(file.name);
      setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
      setAnalysis(analysisResponse.analysis);

      // Add these lines to store score and aiScore
      setScore(analysisResponse.score);
      setAiScore(analysisResponse.aiScore);

      // Store the session ID if returned by the API
      if (analysisResponse.sessionId) {
        setSessionId(analysisResponse.sessionId);
      }
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      setAnalysis('Error analyzing PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setAnalysis('');
    setFileName('');
    setFileSize('');
  };

  const isClerkEnabled = process.env.NEXT_PUBLIC_CLERK_ENABLED === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <Head>
        <title>HumbleMePlz - See how unqualified you are</title>
        <meta name="description" content="Get honest, brutal feedback on your resume to improve your job search. Upload your CV for a professional analysis that will help you land more interviews." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="keywords" content="resume review, CV feedback, resume roasting, job application help, career advice, resume improvement" />

        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content="HumbleMePlz - Get Brutal Resume Feedback" />
        <meta property="og:description" content="Upload your resume for an honest analysis that will help you understand why you're not getting interviews." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://humblemeplz.com" />
        <meta property="og:image" content="/og-image.jpg" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HumbleMePlz - See how unqualified you are" />
        <meta name="twitter:description" content="Get honest feedback on your resume to improve your job search success rate." />
        <meta name="twitter:image" content="/twitter-image.jpg" />

        {/* Canonical Link */}
        <link rel="canonical" href="https://humblemeplz.com" />

        {/* Favicon Tags */}
        <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png" />
        <link rel="manifest" href="site.webmanifest" />
        <link rel="mask-icon" href="safari-pinned-tab.svg" color="#991b1b" />
        <meta name="msapplication-TileColor" content="#991b1b" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      {isClerkEnabled && <HeaderMenu />}
      <header className="py-4 px-6 flex justify-end">
        {isClerkEnabled && (
          <SignedOut>
            <Link href="/login" className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors">
              Login
            </Link>
          </SignedOut>
        )}
      </header>
      <main className="flex-1 flex flex-col justify-center container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-5xl md:text-6xl font-title text-red-800 text-center mb-3 tracking-wide">
            HumbleMePlz.com
          </h1>
          <p className="text-gray-600 text-center mb-12 text-lg">
            No callbacks? No worries. We'll roast your résumé into a better one.
            <br />
            <span className="text-red-800 font-medium">See how unqualified you are.</span>
          </p>

          {!analysis && (
            <>
              <div className="mb-6 text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  For LinkedIn profiles: Go to your profile &gt; Locate the "Resources" Button &gt; Save to PDF, then upload the file
                </p>
              </div>
              <FileUploader onUpload={handleFileUpload} isLoading={isLoading} />
            </>
          )}
          {analysis && (
            <Analysis
              analysis={analysis}
              fileName={fileName}
              fileSize={fileSize}
              onTryAgain={handleTryAgain}
              onGetHelp={() => setIsModalOpen(true)}
              score={score}
              aiScore={aiScore}
            />
          )}
        </div>

        <PaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sessionId={sessionId || undefined}
        />
      </main>

      <footer className="text-center text-sm text-gray-500 py-6">
        <p>Your data is not saved. Only the text is extracted for analysis.</p>
        <p className="mt-2">© {new Date().getFullYear()} HumbleMePlz.com</p>
      </footer>
    </div>
  );
}