import { ScoreBar } from './ScoreBar';
import { SocialShareButtons } from './SocialShareButtons';
import { motion } from 'framer-motion';

interface AnalysisProps {
  analysis: string;
  fileName?: string;
  fileSize?: string;
  onTryAgain: () => void;
  onGetHelp: () => void;
  score: number;
  aiScore: number;
}

export const Analysis: React.FC<AnalysisProps> = ({ analysis, fileName, fileSize, onTryAgain, onGetHelp, score, aiScore }) => {
  return (
    <motion.div 
      className="bg-white rounded-lg p-4 sm:p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 text-gray-600 mb-4 flex-wrap">
        <svg className="w-5 h-5 text-red-800 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="font-medium truncate max-w-[150px] sm:max-w-none">{fileName}</span>
        <span className="text-sm text-gray-500">{fileSize}</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <ScoreBar score={score} aiScore={aiScore} />
      </motion.div>

      <motion.div 
        className="text-gray-800 whitespace-pre-wrap mb-6 mt-6 text-sm sm:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {analysis}
      </motion.div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <motion.button
          onClick={onTryAgain}
          className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Try another resume
        </motion.button>

        <motion.button
          onClick={onGetHelp}
          className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 w-full sm:w-auto justify-center"
          whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          How to improve my resume
        </motion.button>
      </div>
      
      <motion.div 
        className="mt-6 mb-6 border-t border-gray-200 pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h3 className="text-center text-lg sm:text-xl font-medium text-gray-700 mb-4">Share your humiliation:</h3>
        <SocialShareButtons analysisText={analysis} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p className="text-gray-600 text-center text-sm sm:text-base mt-6">Don't worry, 98% of people leave here depressed too.</p>
        <p className="text-gray-600 text-center text-xs sm:text-sm mt-2">This is just a joke. Don't use it as professional advice.</p>
      </motion.div>
    </motion.div>
  );
};