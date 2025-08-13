import React, { useRef, useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

const MessageHandler = ({ 
  messages, 
  selectedChat, 
  onLoadMoreMessages, 
  isLoadingOldMessages,
  currentPage,
  totalPages // Add totalPages prop
}) => {
  const messagesEndRef = useRef(null);
  const messagesStartRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [audioStates, setAudioStates] = useState({});
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);


  
  // Replace the current useEffect for scrolling on chat selection
  useEffect(() => {
    // Only auto-scroll on initial chat selection
    if (selectedChat?._id) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          scrollToBottom(false);
        }
      }, 200);
    }
  }, [selectedChat?._id]); // Remove currentPage dependency

  // Replace the useEffect for auto-scrolling on new messages
  useEffect(() => {
    // Only scroll to bottom for new outgoing messages
    // Not when loading older messages
    if (messages.length > prevMessagesLength && 
        prevMessagesLength !== 0 && 
        messages[messages.length - 1]?.isOwn &&
        currentPage === 1) { // Only auto-scroll on current page
      scrollToBottom(true);
    }
    setPrevMessagesLength(messages.length);
  }, [messages, currentPage]);

  // Modify the scroll position maintenance effect
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    // If we loaded more messages and they're not our own messages
    if (messages.length > prevMessagesLength && 
        prevMessagesLength !== 0 && 
        currentPage > 1) {
      
      // Store the old scroll height and position BEFORE React updates the DOM
      const scrollContainer = scrollContainerRef.current;
      const oldScrollHeight = scrollContainer.scrollHeight;
      const oldScrollTop = scrollContainer.scrollTop;
      
      // Use a more reliable approach with setTimeout instead of requestAnimationFrame
      setTimeout(() => {
        if (scrollContainer) {
          // Get new scroll height after React has updated the DOM
          const newScrollHeight = scrollContainer.scrollHeight;
          // Calculate how much the content height has grown
          const heightDifference = newScrollHeight - oldScrollHeight;
          
          // Adjust scroll position to maintain the same view
          if (heightDifference > 0) {
            scrollContainer.scrollTop = oldScrollTop + heightDifference;
          }
        }
      }, 10); // Small timeout to ensure DOM has updated
    }
    
    setPrevMessagesLength(messages.length);
  }, [messages.length, prevMessagesLength, currentPage]);
  
  // Improved observer setup for loading more messages
  useEffect(() => {
    if (!scrollContainerRef.current || !messagesStartRef.current) {
      console.log('Missing refs for infinite scroll');
      return;
    }
    

    
    const options = {
      root: scrollContainerRef.current,
      rootMargin: '200px', // Increased to trigger earlier
      threshold: 0.1,
    };
    
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];

      
      if (entry.isIntersecting && !isLoadingOldMessages && selectedChat && currentPage < totalPages) {

        onLoadMoreMessages();
      } 
    }, options);
    
    observer.observe(messagesStartRef.current);
    
    return () => {
      if (messagesStartRef.current) {
        observer.unobserve(messagesStartRef.current);
      }
    };
  }, [isLoadingOldMessages, onLoadMoreMessages, selectedChat, currentPage, totalPages]);
  
  // Updated to accept behavior parameter
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? "smooth" : "auto" 
    });
  };

  // Function to determine if attachment is an image
  const isImageAttachment = (url) => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png)$/i) || url.startsWith('data:image');
  };

  // Function to determine if attachment is audio
  const isAudioAttachment = (url) => {
    if (!url) return false;
    return url.match(/\.(mp3|wav|ogg|mpa|m4a|wma|flac|aac)$/i);
  };

  // Open image in fullscreen
  const openFullscreen = (imageUrl) => {
    setFullscreenImage(imageUrl);
  };

  // Close fullscreen view
  const closeFullscreen = () => {
    setFullscreenImage(null);
  };
  
  // Audio player controls
  const handleAudioPlay = (audioId, audioElement) => {
    setAudioStates(prev => ({
      ...prev,
      [audioId]: {
        ...prev[audioId],
        isPlaying: true,
        currentTime: audioElement.currentTime,
        duration: audioElement.duration || 0
      }
    }));
  };

  const handleAudioPause = (audioId, audioElement) => {
    setAudioStates(prev => ({
      ...prev,
      [audioId]: {
        ...prev[audioId],
        isPlaying: false,
        currentTime: audioElement.currentTime
      }
    }));
  };

  const handleAudioTimeUpdate = (audioId, audioElement) => {
    setAudioStates(prev => ({
      ...prev,
      [audioId]: {
        ...prev[audioId],
        currentTime: audioElement.currentTime,
        duration: audioElement.duration || 0
      }
    }));
  };

  const handleAudioSeek = (audioId, newTime) => {
    const audioElement = document.getElementById(`audio-${audioId}`);
    if (audioElement) {
      audioElement.currentTime = newTime;
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // Process messages to split attachments into separate messages
  const processedMessages = [];
  
  messages.forEach(message => {
    // If the message has text content, add it as a separate message
    if (message.text) {
      processedMessages.push({
        ...message,
        id: `${message.id}-text`,
        attachments: undefined // No attachments for this message
      });
    }
    
    // Then add each attachment as a separate message
    if (message.attachments && message.attachments.length > 0) {
      message.attachments.forEach((url, index) => {
        processedMessages.push({
          ...message,
          id: `${message.id}-att-${index}`,
          text: '', // No text for attachment messages
          attachments: [url], // Just this single attachment
          isAttachmentOnly: true
        });
      });
    }
    
    // If it's a pending message with no text and no attachments yet (pure loading state)
    // Add it as a standalone loading indicator message
    if (message.pending && (!message.text || message.text.trim() === '') && (!message.attachments || message.attachments.length === 0)) {
      processedMessages.push({
        ...message,
        id: `${message.id}-pending`,
        isLoadingOnly: true
      });
    }
  });

  if (!selectedChat) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <p className="text-xl font-semibold">Select a chat to start messaging</p>
          <p className="text-sm mt-2">Your messages will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 overflow-y-auto bg-gray-50 relative" ref={scrollContainerRef}>
      
      {/* Loading indicator for older messages */}
      {isLoadingOldMessages && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
        </div>
      )}
      
      {/* Reference for intersection observer to detect when we reach the top */}
      <div ref={messagesStartRef} className="h-1"></div>
      
      {/* Date separator */}
      <div className="flex justify-center my-4">
        <div className="bg-gray-700 text-white text-xs px-2 py-1 rounded-md">
          {new Date().toLocaleDateString()}
        </div>
      </div>
      
      <div className="flex flex-col space-y-1">
        {processedMessages.map((message) => {
          // For loading-only messages (attachments with no caption)
          if (message.isLoadingOnly) {
            return (
              <div 
                key={message.id} 
                className="flex justify-end"
              >
                <div className="max-w-[85%] bg-[rgb(216,252,211)] text-black rounded-lg px-3 py-2.5 shadow-sm relative">
                  <div className="flex items-center text-xs text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Sending attachment...
                  </div>
                </div>
              </div>
            );
          }
          
          // Determine attachment type
          const hasAttachment = message.attachments && message.attachments.length > 0;
          const attachment = hasAttachment ? message.attachments[0] : null;
          const isImage = hasAttachment && isImageAttachment(attachment);
          const isAudio = hasAttachment && isAudioAttachment(attachment);
          const audioId = `${message.id}-audio`;
          
          // Get audio state if it exists
          const audioState = audioStates[audioId] || { isPlaying: false, currentTime: 0, duration: 0 };
          
          // Handle short messages and timestamp placement
          // If message is short, we'll add special styling to ensure timestamp is positioned correctly
          const isShortText = message.text && message.text.length < 15 && !hasAttachment;
          
          return (
            <div 
              key={uuidv4()}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`${message.isOwn ? 'bg-[rgb(216,252,211)] text-black' : 'bg-white border border-gray-200'} rounded-lg px-3 py-1.5 shadow-sm relative ${isAudio ? 'max-w-[95%] sm:max-w-[75%] md:max-w-[65%]' : 'max-w-[85%]'}`}>
                {!message.isOwn && (selectedChat.groupChat === true) && (
                  <div className="text-xs text-gray-500 mb-1 font-bold">
                    {message.senderName || "NO SENDER NAME!"}
                  </div>
                )}
                
                {/* Render attachments based on their type */}
                {hasAttachment && (
                  <div className={message.text ? "mb-1" : ""}>
                    {isImage ? (
                      <div className="inline-block border border-gray-100 rounded-md overflow-hidden relative">
                        <img 
                          src={attachment} 
                          alt="Attachment"
                          className="max-w-[350px] max-h-80 object-contain cursor-pointer"
                          onClick={() => openFullscreen(attachment)}
                        />
                        {/* Time overlay for images */}
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] bg-black bg-opacity-50 text-white">
                          {message.time}
                        </div>
                      </div>
                    ) : isAudio ? (
                      <div className="py-1">
                        {/* Enhanced Audio Player UI - adjusted padding and width */}
                        <div className="flex flex-col w-full bg-gray-100 rounded-lg px-4 py-1">
                          <div className="flex items-center">
                            <div className="flex items-center text-xs text-gray-700 font-medium">
                              <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                              {/* Extract and display filename nicely */}
                              {attachment.split('/').pop().replace(/%20/g, ' ').substring(0, 30)}
                              {attachment.split('/').pop().length > 30 ? '...' : ''}
                            </div>
                          </div>
                          
                          <audio 
                            id={`audio-${audioId}`}
                            className="hidden"
                            preload="metadata"
                            onPlay={(e) => handleAudioPlay(audioId, e.target)}
                            onPause={(e) => handleAudioPause(audioId, e.target)}
                            onTimeUpdate={(e) => handleAudioTimeUpdate(audioId, e.target)}
                            onLoadedMetadata={(e) => handleAudioTimeUpdate(audioId, e.target)}
                          >
                            <source src={attachment} />
                          </audio>
                          
                          {/* Custom audio player UI */}
                          <div className="flex items-center mt-1 mb-0">
                            <button 
                              onClick={() => {
                                const audio = document.getElementById(`audio-${audioId}`);
                                if (audio) {
                                  if (audioState.isPlaying) {
                                    audio.pause();
                                  } else {
                                    audio.play();
                                  }
                                }
                              }}
                              className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full ${message.isOwn ? 'bg-green-600' : 'bg-blue-500'} text-white`}
                            >
                              {audioState.isPlaying ? (
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"></path>
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"></path>
                                </svg>
                              )}
                            </button>
                            
                            {/* Progress bar */}
                            <div className="mx-2 flex-grow relative h-1.5 bg-gray-300 rounded cursor-pointer" 
                                 onClick={(e) => {
                                   const rect = e.currentTarget.getBoundingClientRect();
                                   const pos = (e.clientX - rect.left) / rect.width;
                                   handleAudioSeek(audioId, pos * audioState.duration);
                                 }}>
                              <div 
                                className={`absolute left-0 top-0 bottom-0 rounded ${message.isOwn ? 'bg-green-500' : 'bg-blue-400'}`}
                                style={{ width: `${audioState.duration ? (audioState.currentTime / audioState.duration) * 100 : 0}%` }}
                              ></div>
                              <div 
                                className={`absolute top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full ${message.isOwn ? 'bg-green-700' : 'bg-blue-600'}`}
                                style={{ left: `${audioState.duration ? (audioState.currentTime / audioState.duration) * 100 : 0}%` }}
                              ></div>
                            </div>
                            
                            {/* Time display */}
                            <div className="text-xs text-gray-500 w-16 text-center">
                              {formatTime(audioState.currentTime)} / {formatTime(audioState.duration)}
                            </div>
                          </div>
                          
                          {/* Message timestamp for audio - reduced spacing */}
                          <div className="text-[9px] text-gray-500 text-right -mt-0.5">
                            {message.time}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center p-2 bg-gray-100 rounded-lg cursor-pointer"
                        onClick={() => window.open(attachment, '_blank')}
                      >
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="ml-2 text-sm text-gray-700">
                          {attachment.split('/').pop().substring(0, 20)}
                          {attachment.split('/').pop().length > 20 ? '...' : ''}
                        </div>
                        <div className="ml-auto text-[9px] text-gray-500 pl-3">
                          {message.time}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Render the message text after the attachment */}
                <div className="relative">
                  {message.text && (
                    <div className={`text-sm ${isShortText ? 'inline-block' : 'block'} pr-14`}>
                      {message.text}
                    </div>
                  )}
                  
                  {/* Loading indicator for pending uploads */}
                  {message.pending && (
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </div>
                  )}
                  
                  {/* Message timestamp - positioned bottom right */}
                  {/* Show timestamp for all messages except images and audio (which have their own timestamp display) */}
                  {(!isImage && !isAudio && message.text) && (
                    <div className="absolute bottom-0 right-0 text-[9px] text-gray-500 px-1">
                      {message.time}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
          
        <div ref={messagesEndRef} data-scroll-anchor="messages-end" />
      </div>
      
      {/* Fullscreen image overlay */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeFullscreen}
        >
          <div className="relative max-w-[90%] max-h-[90vh]">
            <img 
              src={fullscreenImage} 
              alt="Fullscreen view" 
              className="max-w-full max-h-[90vh] object-contain"
            />
            
            {/* Close button */}
            <button 
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg"
              onClick={closeFullscreen}
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageHandler;
