import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';

interface AppShellProps {
  children: ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  
  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';
  
  // If landing page, render without AppShell wrapper
  if (isLandingPage) {
    return <>{children}</>;
  }
  
  // Determine header configuration based on current route
  const getHeaderProps = () => {
    switch (location.pathname) {
      case '/dashboard':
        return {
          showLogo: true,
          title: 'Your Campaigns Dashboard',
          showNewCampaign: true,
          centered: false
        };
      default:
        if (location.pathname.startsWith('/results/')) {
          return {
            showLogo: true,
            title: 'Campaign Results',
            showNewCampaign: true,
            centered: false
          };
        }
        return {
          showLogo: true,
          title: null,
          showNewCampaign: true,
          centered: false
        };
    }
  };

  const headerProps = getHeaderProps();

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-primary">
      <Header {...headerProps} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent-cyan/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent-purple/5 to-transparent rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default AppShell;
