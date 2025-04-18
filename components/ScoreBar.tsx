import React from 'react';

interface ScoreBarProps {
  score: number;  // 0-100 (humiliation score)
  aiScore: number; // 1-10 (CV rating)
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ score, aiScore }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-600">Humiliation Level</div>
        <div className="text-sm font-bold text-gray-800">{score}%</div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-red-600 transition-all duration-500 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-4 mb-2">
        <div className="text-sm font-medium text-gray-600">Resume Rating</div>
        <div className="text-sm font-bold text-gray-800">{aiScore}/10</div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${(aiScore / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}; 