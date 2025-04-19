import React, { useEffect } from 'react';

interface ScoreBarProps {
  score: number;  // 0-100 (humiliation score)
  aiScore: number; // 1-10 (CV rating)
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ score, aiScore }) => {
  // Ensure score is between 0-100
  const validScore = Math.min(100, Math.max(0, Number(score) || 85));
  
  // Ensure aiScore is between 1-10
  const validAiScore = Math.min(10, Math.max(1, Number(aiScore) || 3));
  
  useEffect(() => {
    console.log("ScoreBar received:", { score, aiScore });
    console.log("ScoreBar using:", { validScore, validAiScore });
  }, [score, aiScore, validScore, validAiScore]);
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-600">Humiliation Level</div>
        <div className="text-sm font-bold text-gray-800">{validScore}%</div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-red-600 transition-all duration-500 ease-out"
          style={{ width: `${validScore}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-4 mb-2">
        <div className="text-sm font-medium text-gray-600">Resume Rating</div>
        <div className="text-sm font-bold text-gray-800">{validAiScore}/10</div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${(validAiScore / 10) * 100}%` }}
        />
      </div>
    </div>
  );
};