import React, { useState } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useUI } from '../contexts/UIContext';
import { Mic, Camera } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { startNewCampaign, userName } = useSession();
  const { addToast } = useUI();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
      await startNewCampaign(text);
      addToast({
        type: 'success',
        title: 'Campaign Started',
        message: 'Your campaign has been initialized successfully.'
      });
      setInputValue('');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Start',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(inputValue);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="text-gray-400">
          {/* Menu icon placeholder */}
        </div>
        <div className="text-center">
          <h1 className="text-xl font-medium text-white">Adewin</h1>
          <p className="text-sm text-gray-400">AI Advertisement Creator</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
          {/* Profile avatar placeholder */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 pb-32">
        {/* Greeting */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            Hello, {userName || 'Marvin'}
          </h2>
        </div>

      </div>

      {/* Input Section */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-3xl border border-gray-700 p-4">
            <div className="flex items-end space-x-4">
              {/* Add/Research button */}
              <button className="text-gray-400 hover:text-white transition-colors p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              {/* Input field */}
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Adewin"
                  className="w-full bg-transparent text-white placeholder-gray-400 resize-none outline-none text-lg min-h-[24px] max-h-32"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-white transition-colors p-2">
                  <Mic className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors p-2">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
