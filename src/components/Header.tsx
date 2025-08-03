import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useUI } from '../contexts/UIContext';

interface HeaderProps {
  showLogo?: boolean;
  title?: string | null;
  showNewCampaign?: boolean;
  centered?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  showLogo = true, 
  title = null,
  showNewCampaign = true,
  centered = false 
}) => {
  const navigate = useNavigate();
  const { userName } = useSession();
  const { darkMode, toggleDarkMode } = useUI();

  const handleNewCampaign = () => {
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="bg-dark-surface border-b border-dark-border sticky top-0 z-40 backdrop-blur-lg bg-dark-surface/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center h-20 ${
          centered ? 'justify-center' : 'justify-between'
        }`}>
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            {showLogo && (
              <button 
                onClick={handleLogoClick}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-xl flex items-center justify-center text-dark-bg font-bold text-lg">
                  AI
                </div>
                <div className="text-xl font-bold text-dark-text-primary">
                  Ad Intelligence
                </div>
              </button>
            )}
            
            {title && (
              <div className="border-l border-dark-border pl-4 ml-4">
                <h1 className="text-lg font-semibold text-dark-text-primary">
                  {title}
                </h1>
              </div>
            )}
          </div>

          {/* Right side - only show if not centered */}
          {!centered && (
            <div className="flex items-center space-x-4">
              {/* Greeting */}
              <div className="hidden sm:block text-dark-text-secondary">
                Hello, <span className="text-accent-cyan font-medium">{userName}</span>!
              </div>

              {/* New Campaign Button */}
              {showNewCampaign && (
                <button
                  onClick={handleNewCampaign}
                  className="btn-primary"
                >
                  + New Campaign
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="btn-ghost p-2"
                title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {/* User Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-pink rounded-full flex items-center justify-center text-dark-bg font-semibold cursor-pointer hover:scale-105 transition-transform">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Centered greeting for landing page */}
          {centered && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-4">
              <div className="text-dark-text-secondary">
                Hello, <span className="text-accent-cyan font-medium">{userName}</span>!
              </div>
              
              <button
                onClick={toggleDarkMode}
                className="btn-ghost p-2"
                title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-pink rounded-full flex items-center justify-center text-dark-bg font-semibold cursor-pointer hover:scale-105 transition-transform">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
