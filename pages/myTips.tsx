import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Head from 'next/head';
import axios from 'axios';
import HeaderMenu from "../components/HeaderMenu";

interface Analysis {
  title: string;
  result: string;
  createdAt: string;
}

export default function MyTips() {
  const { userId } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<string[]>([]); // New state for badges

  useEffect(() => {
    if (userId) {
      axios.get(`/api/getUserAnalyses?userId=${userId}`)
        .then((response) => {
          setAnalyses(response.data);
          setLoading(false);
          // Example logic to determine badges
          if (response.data.length >= 10) {
            setBadges([...badges, "Analysis Master"]);
          }
        })
        .catch((error) => {
          console.error("Error fetching analyses:", error);
          setLoading(false);
        });
    }
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <Head>
        <title>My Tips - HumbleMePlz</title>
        <meta name="description" content="View your previous analyses" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <HeaderMenu />
      <main className="flex-1 flex flex-col justify-center container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-5xl md:text-6xl font-title text-red-800 text-center mb-3 tracking-wide">
            My Tips
          </h1>
          <p className="text-gray-600 text-center mb-12 text-lg">
            Review your past analyses and see how you've improved.
          </p>
          {/* Display badges */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Your Badges</h2>
            <div className="flex justify-center space-x-4">
              {badges.map((badge, index) => (
                <span key={index} className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : (
            <ul className="space-y-4">
              {analyses.map((analysis, index) => (
                <li key={index} className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold">{analysis.title}</h2>
                  <p className="text-gray-600">{analysis.result}</p>
                  <p className="text-gray-500 text-sm">Date: {new Date(analysis.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <footer className="text-center text-sm text-gray-500 py-6">
        <p>Your data is not saved. Only the text is extracted for analysis.</p>
        <p className="mt-2">© 2025 HumbleMePlz.com</p>
      </footer>
    </div>
  );
}
