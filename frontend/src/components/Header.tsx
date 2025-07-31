import React from 'react';
import { Sparkles, Brain } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary-600" />
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Advertisement Intelligence
              </h1>
              <p className="text-sm text-gray-500">
                AI-Powered Ad Generation Platform
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Smart • Fast • Effective</p>
              <p className="text-xs text-gray-400">Generate ads that convert</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
