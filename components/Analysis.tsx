interface AnalysisProps {
  analysis: string;
  fileName?: string;
  fileSize?: string;
  onTryAgain: () => void;
  onGetHelp: () => void;
  score: number;
  aiScore: number;
}

import { ScoreBar } from './ScoreBar';

export const Analysis: React.FC<AnalysisProps> = ({ analysis, fileName, fileSize, onTryAgain, onGetHelp, score, aiScore }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 text-gray-600 mb-4">
        <svg className="w-5 h-5 text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="font-medium">{fileName}</span>
        <span className="text-sm text-gray-500">{fileSize}</span>
      </div>

      <ScoreBar score={score} aiScore={aiScore} />

      <div className="text-gray-800 whitespace-pre-wrap mb-6 mt-4">
        {analysis}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={onTryAgain}
          className="inline-flex items-center text-gray-700 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Try another resume
        </button>

        <button
          onClick={onGetHelp}
          className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          How to improve my resume
        </button>
      </div>
    </div>
  );
}; 