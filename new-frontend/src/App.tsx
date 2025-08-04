import React from 'react';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-fg">
      <ChatInterface />
    </div>
  );
};

export default App;

