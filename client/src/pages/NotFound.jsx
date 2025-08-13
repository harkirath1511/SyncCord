import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 py-16 text-white">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">404</h1>
        <p className="text-2xl font-bold tracking-tight text-white mt-4">Page Not Found</p>
        <p className="text-gray-400 mt-2 mb-8">The page you are looking for doesn't exist or has been moved.</p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200"
          >
            Go Home
          </Link>
        
        </div>
      </div>
    </div>
  );
}

export default NotFound;
