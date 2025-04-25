import { useState } from 'react';
import { Dialog } from '@headlessui/react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export const PaymentModal = ({ isOpen, onClose, sessionId }: PaymentModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sessionId
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-0 shadow-2xl overflow-hidden w-full">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-5">
            <Dialog.Title className="text-xl font-bold text-white">
              Get Your Personalized Resume Transformation
            </Dialog.Title>
            <p className="text-white text-opacity-90 mt-1 text-sm">
              Unlock expert advice to improve your resume
            </p>

            {/* Social Proof */}
            <div className="mt-3 bg-white/20 rounded-md px-3 py-2 text-white text-sm flex items-center">
              <svg className="w-4 h-4 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Trusted by 10,000+ professionals</span>
            </div>
          </div>

          {/* What's included section */}
          <div className="bg-gray-50 p-4">
            <h3 className="font-medium text-gray-700 mb-2">What You'll Get:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm text-gray-600">Detailed strengths & weaknesses analysis</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm text-gray-600">Industry-specific recommendations</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm text-gray-600">Actionable improvement plan (PDF download)</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm text-gray-600">Personalized skill development roadmap</span>
              </li>
            </ul>
          </div>

          {/* Price tag with improved styling */}
          <div className="bg-green-50 p-4 border-b border-green-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Price:</span>
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-500 line-through">$9.99 USD</span>
                <span className="text-xl font-bold text-green-700">$6.99 USD</span>
                <span className="text-xs text-red-600 font-medium">Save 30%</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">One-time payment, instant access</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-cyan-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-cyan-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7890"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-cyan-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
              </div>
            </div> */}

            {/* Trust indicators and payment processors */}
            <div className="mt-4">
              <div className="flex items-center justify-center space-x-4 mb-3">
                <img src="/images/stripe.png" alt="Stripe" />
              </div>
          
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay with Card
              </button>
            </div>
          </form>
          {/* <div className="bg-gray-50 p-4 text-xs text-center text-gray-500 border-t">
            By proceeding, you agree to our Terms of Service and Privacy Policy
          </div> */}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};