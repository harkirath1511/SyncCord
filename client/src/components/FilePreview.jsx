import React, { useState } from 'react';

const FilePreview = ({ file, onCancel, onSend }) => {
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isImage = file && file.type.startsWith('image/');
  
  if (!file) return null;
  
  const handleSend = () => {
    setIsLoading(true);
    onSend(customMessage);

  };
  
  return (
    <div className="border-t border-gray-200 bg-[#f0f2f5] p-2">
      <div className="flex flex-col bg-white rounded-lg shadow-sm max-w-[90%] mx-auto">
        {/* File preview section */}
        <div className="flex items-center p-3 border-b border-gray-100">
          <div className="mr-3">
            {isImage ? (
              <div className="h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate max-w-xs">
              {file.name}
            </div>
            <div className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>
          
          {!isLoading && (
            <button 
              onClick={onCancel}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Message input section */}
        <div className="flex items-center p-2">
          <input
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add a caption..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            disabled={isLoading}
          />
          
          {isLoading ? (
            <div className="ml-2 p-2 bg-gray-300 text-white rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          ) : (
            <button 
              onClick={handleSend}
              className="ml-2 p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
