
import React from 'react';

const App: React.FC = () => {
  return (
    <main className="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans">
      <div className="text-center p-8 max-w-lg mx-auto">
        <div className="bg-gray-800/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border-2 border-teal-400/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-500">
          Blank React App
        </h1>
        <p className="text-lg text-gray-400">
          Your Vercel-ready application starts here. Edit <code className="bg-gray-700 rounded-md px-2 py-1 text-teal-300">App.tsx</code> to begin.
        </p>
      </div>
    </main>
  );
};

export default App;
