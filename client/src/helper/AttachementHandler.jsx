import React, { useRef, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; 

const AttachmentHandler = ({ onFileSelect, onUploadStart, onUploadProgress, onUploadSuccess, onUploadError, selectedChat }) => {
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // File type configurations
  const fileTypeConfigs = {
    image: {
      accept: 'image/*',
      maxSize: 5 * 1024 * 1024, // 5MB
      ref: imageInputRef,
      label: 'Image',
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    document: {
      accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt',
      maxSize: 10 * 1024 * 1024, // 10MB
      ref: documentInputRef,
      label: 'Document',
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    audio: {
      accept: 'audio/*',
      maxSize: 15 * 1024 * 1024, // 15MB
      ref: audioInputRef,
      label: 'Audio',
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    }
  };

  const handleAttachmentClick = (type) => {
    const config = fileTypeConfigs[type];
    if (config && config.ref.current) {
      config.ref.current.click();
    }
  };

  // Replace the current handleFileChange function with this:
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
    
    // Check file type is allowed
    const config = fileTypeConfigs[type];
    if (!file.type.startsWith(type === 'document' ? 'application/' : type)) {
      onUploadError({ 
        message: `Invalid file type. Please select a ${type} file.`
      }, null);
      return;
    }
    
    // Check file size
    if (file.size > config.maxSize) {
      onUploadError({ 
        message: `File too large. Maximum size is ${config.maxSize / (1024 * 1024)}MB.`
      }, null);
      return;
    }
    
    // Just call onFileSelect to show preview - don't create temp message or start upload
    if (onFileSelect) {
      onFileSelect(file, type);
      console.log("File selected and validation complete. Preview should show now.");
    }
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleFileChange(e, 'image')}
        accept={fileTypeConfigs.image.accept}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={documentInputRef}
        onChange={(e) => handleFileChange(e, 'document')}
        accept={fileTypeConfigs.document.accept}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={audioInputRef}
        onChange={(e) => handleFileChange(e, 'audio')}
        accept={fileTypeConfigs.audio.accept}
        style={{ display: 'none' }}
      />
      
      {/* Attachment menu items */}
      <button
        type="button"
        onClick={() => handleAttachmentClick('image')}
        disabled={isUploading || !selectedChat}
        className={`flex items-center px-4 py-2 w-full text-left hover:bg-gray-100 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {fileTypeConfigs.image.icon}
        <span>Photo</span>
      </button>
      
      <button
        type="button"
        onClick={() => handleAttachmentClick('document')}
        disabled={isUploading || !selectedChat}
        className={`flex items-center px-4 py-2 w-full text-left hover:bg-gray-100 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {fileTypeConfigs.document.icon}
        <span>Document</span>
      </button>
      
      <button
        type="button"
        onClick={() => handleAttachmentClick('audio')}
        disabled={isUploading || !selectedChat}
        className={`flex items-center px-4 py-2 w-full text-left hover:bg-gray-100 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {fileTypeConfigs.audio.icon}
        <span>Audio</span>
      </button>
    </>
  );
};

export default AttachmentHandler;
