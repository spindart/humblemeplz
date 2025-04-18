import { useState } from 'react';
import Head from 'next/head';
import { FileUploader } from '../components/FileUploader';
import { Analysis } from '../components/Analysis';
import { PaymentModal } from '../components/PaymentModal';

export default function Home() {
  const [pdfText, setPdfText] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');

  const handleFileUpload = async (analysis: string, file: File) => {
    setIsLoading(true);
    try {
      setFileName(file.name);
      setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
      setAnalysis(analysis);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <Head>
        <title>HumbleMePlz - Get Roasted, Get Better</title>
        <meta name="description" content="Upload your resume for a brutal but honest analysis" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-1 flex flex-col justify-center container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-5xl md:text-6xl font-title text-red-800 text-center mb-3 tracking-wide">
            HumbleMePlz.com
          </h1>
          <p className="text-gray-600 text-center mb-12 text-lg">
            Find out why you haven't even been called for an internship yet.
            <br />
            <span className="text-red-800 font-medium">See how unqualified you are.</span>
          </p>

          {!analysis && <FileUploader onUpload={handleFileUpload} isLoading={isLoading} />}
          {analysis && (
            <Analysis
              analysis={analysis}
              fileName={fileName}
              fileSize={fileSize}
              onTryAgain={handleTryAgain}
              onGetHelp={() => setIsModalOpen(true)}
            />
          )}
        </div>

        <PaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* <p className="text-gray-600 text-center mt-6 text-lg">Don't worry, 98% of people leave here depressed too.</p> */}
      </main>

      <footer className="text-center text-sm text-gray-500 py-6">
        <p>Your data is not saved. Only the text is extracted for analysis.</p>
        <p className="mt-2">© 2025 HumbleMePlz.com</p>
      </footer>
    </div>
  );
} 