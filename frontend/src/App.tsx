import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdGenerationWizard from './components/AdGenerationWizard';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<AdGenerationWizard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
