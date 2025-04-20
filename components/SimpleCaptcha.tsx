import React, { useState, useEffect } from 'react';

interface SimpleCaptchaProps {
  onVerify: (success: boolean) => void;
}

export const SimpleCaptcha: React.FC<SimpleCaptchaProps> = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);

  // Generate a random captcha text
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setError(false);
    setIsVerified(false);
  };

  // Initialize captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.toLowerCase() === captchaText.toLowerCase()) {
      setIsVerified(true);
      setError(false);
      onVerify(true);
    } else {
      setError(true);
      generateCaptcha();
      onVerify(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Prove you're human</h3>
      
      <div className="mb-4">
        <div className="bg-gray-100 p-3 rounded-md text-center relative">
          <span className="select-none text-xl font-mono tracking-widest text-gray-700 
            inline-block transform -skew-x-12">
            {captchaText.split('').map((char, i) => (
              <span 
                key={i} 
                style={{
                  display: 'inline-block',
                  transform: `translateY(${Math.random() * 6 - 3}px) rotate(${Math.random() * 10 - 5}deg)`,
                  marginRight: '2px'
                }}
              >
                {char}
              </span>
            ))}
          </span>
          <button 
            type="button"
            onClick={generateCaptcha}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            aria-label="Refresh captcha"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="captcha-input" className="block text-sm font-medium text-gray-700 mb-1">
            Enter the text above
          </label>
          <input
            id="captcha-input"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-800'}`}
            placeholder="Enter captcha text"
            required
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">
              Incorrect captcha. Please try again.
            </p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-red-800 text-white py-2 px-4 rounded-md hover:bg-red-700 
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {isVerified ? 'Verified ✓' : 'Verify'}
        </button>
      </form>
    </div>
  );
};