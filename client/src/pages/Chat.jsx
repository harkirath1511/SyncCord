import React, { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { getSocket } from '../socket/socket.jsx'
import { NEW_ATTACHEMENTS, NEW_MESSAGE, NEW_MESSAGE_ALERT } from '../constants/constants.js'
import auth from '../utils/auth.js'
import MessageHandler from '../helper/MessageHandler.jsx'
import AttachmentHandler from '../helper/AttachementHandler.jsx';
import FilePreview from '../components/FilePreview';
import { v4 as uuidv4 } from 'uuid';

function Chat({ currentUser }) {
  // State declarations
  const [users, setUsers] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatsLoading, setChatsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [chatMembers, setChatMembers] = useState([])
  const [chatDetails, setChatDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showUserInfoPopup, setShowUserInfoPopup] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [attachmentErrors, setAttachmentErrors] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingOldMessages, setIsLoadingOldMessages] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Add this new state for managing the add members modal
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [selectedFriendsToAdd, setSelectedFriendsToAdd] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);
  const [addMemberError, setAddMemberError] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(null);
  const [removeError, setRemoveError] = useState(null);


  
  const popupRef = useRef(null);
  const userButtonRef = useRef(null);
  const attachmentMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const deletePopupRef = useRef(null);
  const addMembersRef = useRef(null);

  
  const socket = getSocket()
  const checkAuth = auth()

  useEffect(() => {
    checkAuth()
  }, [])


  
  // Function to fetch messages with pagination - improved implementation
  const fetchMessages = async (page = 1, isInitialLoad = false) => {
    if (!selectedChat) return;
    
    if (!isInitialLoad) {
      setIsLoadingOldMessages(true);
    }
    
    try {
      
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/message/getMessages/${selectedChat._id}?page=${page}`, 
        { withCredentials: true }
      );
      

      axios.defaults.headers.common['Cache-Control'] = 'no-cache';
      
      const transformedMessages = res.data.data.messages.map(msg => ({
        id: msg._id,
        senderId: msg.sender?._id,
        senderAvt: msg.sender?.avatar,
        senderName: msg.sender?.fullName,
        text: msg.content,
        attachments: msg.attachements, 
        createdAt: msg.createdAt,
        time: new Date(msg.createdAt).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isOwn: msg.sender._id === currentUser.id
      }));
      
      transformedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      

      if (res.data && res.data.data && typeof res.data.data.pages === 'number') {

        setTotalPages(res.data.data.pages);
      } else {

      }
      
      if (isInitialLoad || page === 1) {

        setMessages(transformedMessages);
        setCurrentPage(1);
        

        if (isInitialLoad) {
          forceScrollToBottom();
        }
      } else {

        const scrollContainer = document.querySelector('.overflow-y-auto');
        const oldScrollHeight = scrollContainer?.scrollHeight || 0;
        const oldScrollTop = scrollContainer?.scrollTop || 0;
        
        // Update messages
        setMessages(prev => [...transformedMessages, ...prev]);
        setCurrentPage(page);
        
        // Use setTimeout to ensure DOM has updated before adjusting scroll
        setTimeout(() => {
          if (scrollContainer) {
            const newScrollHeight = scrollContainer.scrollHeight;
            const heightDifference = newScrollHeight - oldScrollHeight;
            if (heightDifference > 0) {
              scrollContainer.scrollTop = oldScrollTop + heightDifference;
            }
          }
        }, 10);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingOldMessages(false);
    }
  };
  
  // Function to load more messages (for infinite scroll)
  const loadMoreMessages = useCallback(() => {

    // Only try to load more if we haven't reached the end and aren't currently loading
    if (currentPage < totalPages && !isLoadingOldMessages) {

      fetchMessages(currentPage + 1, false);
    } 
  }, [currentPage, totalPages, isLoadingOldMessages, fetchMessages]);

  // Fetch chats based on filter
  useEffect(() => {
    const fetchData = async () => {
      try {
        setChatsLoading(true)
        let res
        if (filter === 'all' && currentUser?.name) {
          res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/chat/getMyChats`, {
            withCredentials: true
          })
          const data = res.data.data.map(chat => {
            if (!chat.groupChat && currentUser.name) {
              const names = chat.name.split('-').map(n => n.trim())
              const otherNames = names.filter(n => n !== currentUser.name)
              return { ...chat, name: otherNames.join('- ') }
            }
            return chat
          })
          setUsers(data)
        } else if (filter === 'friends') {
          res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/users/getAllFriends`, {
            withCredentials: true
          })
          setUsers(res.data.data)
        } else if (filter === 'groups') {
          res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/group/getAllGrps`, {
            withCredentials: true
          })
          setUsers(res.data.data)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setChatsLoading(false)
      }
    }
    fetchData()
  }, [filter, currentUser])


useEffect(() => {
  // Function to handle clicks outside the popup
  function handleClickOutside(event) {
    // Check if popup is open
    if (!showUserInfoPopup) return;
    
    // Check if click is outside both the popup and the button that opens it
    if (
      popupRef.current && 
      !popupRef.current.contains(event.target) &&
      userButtonRef.current && 
      !userButtonRef.current.contains(event.target)
    ) {
      setShowUserInfoPopup(false);
    }
  }
  
  document.addEventListener('mousedown', handleClickOutside);
  
  // Clean up
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showUserInfoPopup]); 


useEffect(() => {
  // Function to handle clicks outside the attachment menu
  function handleAttachmentClickOutside(event) {
    if (!showAttachmentMenu) return;
    
    // Get references to the button and menu
    const attachmentButton = document.querySelector('button[aria-controls="attachment-menu"]');
    
    if (
      attachmentMenuRef.current && 
      !attachmentMenuRef.current.contains(event.target) &&
      (!attachmentButton || !attachmentButton.contains(event.target))
    ) {
      setShowAttachmentMenu(false);
    }
  }
  

  document.addEventListener('mousedown', handleAttachmentClickOutside);
  

  return () => {
    document.removeEventListener('mousedown', handleAttachmentClickOutside);
  };
}, [showAttachmentMenu]);


  //
  useEffect(() => {
    if (selectedChat) {
      // Clear messages immediately when switching chats to prevent showing old messages
      setMessages([]);
      setChatMembers(selectedChat.members || []);
      
      // Reset pagination when changing chats
      setCurrentPage(1);
      setTotalPages(1);
      
      // Use your existing fetchMessages function with pagination
      fetchMessages(1, true);
    // Clear message input when switching chats
    setNewMessage('');
    }
  }, [selectedChat, currentUser])


const newMessagesHandler = useCallback((data) => {
  if (data.message && data.message.chat === selectedChat?._id) {
    const newMsg = {
      id: data.message._id,
      senderId: data.message.sender._id,
      senderAvt: data.message.sender.avatar,
      senderName: data.message.sender.fullName || data.message.sender.name,
      text: data.message.content,
      createdAt: data.message.createdAt,
      time: new Date(data.message.createdAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      isOwn: data.message.sender._id === currentUser.id
    }
    

    setMessages(prev => {
      const updatedMessages = [...prev, newMsg];
      return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });
  }
}, [selectedChat, currentUser.id]);

const newAttachmentHandler = useCallback((data) => {
  if (data.message && data.chatId === selectedChat?._id) {
    const attachmentUrls = data.message.attachements || [];
    
    // Create a new message object for the UI
    const newMsg = {
      id: data.message._id || data.message.id,
      senderId: data.message.sender._id || data.message.sender.id,
      senderAvt: data.message.sender.avatar,
      senderName: data.message.sender.fullName || data.message.sender.name,
      text: data.message.content,
      attachments: attachmentUrls,
      createdAt: data.message.createdAt,
      time: new Date(data.message.createdAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      isOwn: (data.message.sender._id || data.message.sender.id) === currentUser.id
    };

    setMessages(prev => {
      const pendingMessages = prev.filter(msg => msg.pending === true);
      if (pendingMessages.length > 0) {
        // Replace the first pending message with the confirmed one
        return prev.map(msg => 
          msg.pending === true ? newMsg : msg
        );
      } else {
        // Just add the new message
        const updatedMessages = [...prev, newMsg];
        return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
    });

    setPendingAttachments([]);
  }
}, [selectedChat, currentUser.id]);



const newAlertHandler = useCallback((data)=>{
  console.log(data.chatId);
})


  useEffect(() => {
    socket.on(NEW_MESSAGE, newMessagesHandler);
    
    return () => {
      socket.off(NEW_MESSAGE, newMessagesHandler)
    }
  }, [newMessagesHandler]);


 useEffect(() => {
    socket.on(NEW_ATTACHEMENTS, newAttachmentHandler );
    
    return () => {
      socket.off(NEW_ATTACHEMENTS, newAttachmentHandler)
    }
  }, [newAttachmentHandler]);


  useEffect(() => {
    socket.on(NEW_MESSAGE_ALERT, newAlertHandler);
  
    return () => {
      socket.off(NEW_MESSAGE_ALERT, newAlertHandler);
    }
  }, [newAlertHandler])
  

  const fetchChatDetails = async (chatId) => {
    if (!chatId) return;
    setIsLoadingDetails(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/chat/chatDetails/${chatId}`, {
        withCredentials: true
      });     
      setChatDetails(res.data.data);
      setShowUserInfoPopup(true); // Show the user popup instead of modal
    } catch (error) {
      console.error("Error fetching chat details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const forceScrollToBottom = () => {
  setTimeout(() => {
    const messagesEndElement = document.querySelector('[data-scroll-anchor="messages-end"]');
    if (messagesEndElement) {
      messagesEndElement.scrollIntoView({ behavior: 'auto' });
    }
  }, 100);
};

// Replace the handleDeleteChat function with this
const handleDeleteChat = () => {
  if (!selectedChat || !selectedChat._id) return;
  setShowDeleteConfirm(true);
  setShowUserInfoPopup(false);
};

// Create a new function to handle the actual deletion
const confirmDeleteChat = async () => {
  setDeleteLoading(true);
  setDeleteError(null);
  
  try {
    // Call the delete API
    const response = await axios.delete(
      `${import.meta.env.VITE_SERVER_URL}/chat/deleteChat/${selectedChat._id}`, 
      { withCredentials: true }
    );
    
    if (response.data && response.data.success) {
      // Close the popups
      setShowDeleteConfirm(false);
      setShowUserInfoPopup(false);
      
      // Clear selected chat
      setSelectedChat(null);
      setMessages([]);
      
      // Refetch the chat list to update the UI
      const fetchData = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/chat/getMyChats`, {
            withCredentials: true
          });
          
          const data = res.data.data.map(chat => {
            if (!chat.groupChat && currentUser.name) {
              const names = chat.name.split('-').map(n => n.trim());
              const otherNames = names.filter(n => n !== currentUser.name);
              return { ...chat, name: otherNames.join('- ') };
            }
            return chat;
          });
          
          setUsers(data);
        } catch (error) {
          console.error("Error refreshing chat list:", error);
        }
      };
      
      fetchData();
    }
  } catch (error) {
    console.error("Error deleting chat:", error);
    setDeleteError(error.response?.data?.message || "Failed to delete chat. Please try again.");
  } finally {
    setDeleteLoading(false);
  }
};

// Add a useEffect to handle clicks outside the delete popup
useEffect(() => {
  function handleClickOutside(event) {
    if (deletePopupRef.current && !deletePopupRef.current.contains(event.target)) {
      setShowDeleteConfirm(false);
    }
  }
  
  if (showDeleteConfirm) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showDeleteConfirm]);


  const handleFileSelect = (file, type) => {
    console.log('File selected in Chat component:', file, type);
    
    // Store both the file and its type
    setFilePreview({
      file: file,
      type: type
    });
    
    // Close attachment menu after file selection
    setShowAttachmentMenu(false);
  };

  const handleUploadStart = (tempMessage) => {
    console.log('Upload started:', tempMessage);
    setMessages(prev => [...prev, tempMessage]);
    setPendingAttachments(prev => [...prev, { id: tempMessage.id, file: tempMessage }]);
    setFilePreview(null); // Clear the preview after upload starts
  };
  

  const handleUploadProgress = (progress) => {
    console.log('Upload progress:', progress);
  };

  const handleUploadSuccess = (uploadedFileData, tempId) => {
  // Remove from pendingAttachments
  setPendingAttachments(prev => prev.filter(item => item.id !== tempId));
  // Remove the temporary message with pending status
  setMessages(prev => prev.filter(msg => msg.id !== tempId));
};
  
  // Handle upload error
  const handleUploadError = (error, tempId) => {
    console.error('Upload error:', error);
    setAttachmentErrors(error.message || 'Failed to upload file');
    
    // Remove the pending message from UI
    setMessages(prev => prev.filter(msg => msg.id !== tempId));
    setPendingAttachments(prev => prev.filter(item => item.id !== tempId));
    
    // Clear error after 5 seconds
    setTimeout(() => {
      setAttachmentErrors(null);
    }, 5000);
  };

  // Send message handler
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() && pendingAttachments.length === 0) return 
    
    socket.emit(NEW_MESSAGE, {
      message: newMessage,
      members: chatMembers,
      chatId: selectedChat._id
    })
    setNewMessage('')
  }

  const handleCancelFileUpload = () => {
    setFilePreview(null);
  };


// Update the handleSendFile function
const handleSendFile = async (customMessage = '') => {
  console.log("handleSendFile called with message:", customMessage);
  
  if (!filePreview || !filePreview.file) {
    console.error("No file preview available");
    return;
  }
  
  const file = filePreview.file;
  const type = filePreview.type;
  
  // Create a temporary ID for tracking this upload
  const tempId = uuidv4();
  
  // Create temporary message for UI feedback
  const tempMessage = {
    id: tempId,
    tempId,
    senderId: currentUser.id,
    text: customMessage || '', // Use custom message without default fallback
    fileName: file.name,
    fileType: type,
    attachments: [],
    pending: true, // Mark as pending
    isOwn: true,
    time: new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  };
  
  // Update UI to show message is being sent
  setMessages(prev => [...prev, tempMessage]);
  setPendingAttachments(prev => [...prev, { id: tempId, file: tempMessage }]);
  
  // Clear the preview
  setFilePreview(null);
  
  // Create form data for API
  const formData = new FormData();
  formData.append('files', file);
  formData.append('chatId', selectedChat?._id);
  formData.append('content', customMessage || '');
  
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/message/message`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // Add upload progress tracking
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          handleUploadProgress(percentCompleted);
        }
      }
    );
    
    // Handle successful upload
    if (response.data && response.data.success) {
      const uploadedFileData = {
        fileUrl: response.data.data.attachements[0],
        fileType: type,
        fileName: file.name
      };
      
      // Call the success handler
      handleUploadSuccess(uploadedFileData, tempId);
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    handleUploadError(error, tempId);
  }
};

// Function to toggle friend selection
const toggleFriendSelection = (friendId) => {
  setSelectedFriendsToAdd(prev => {
    if (prev.includes(friendId)) {
      return prev.filter(id => id !== friendId);
    } else {
      return [...prev, friendId];
    }
  });
};


const handleAddMembers = async () => {
  if (selectedFriendsToAdd.length === 0) {
    setAddMemberError("Please select at least one friend to add");
    return;
  }
  
  try {
    setAddingMembers(true);
    setAddMemberError(null);
    
    const response = await axios.patch(
      `${import.meta.env.VITE_SERVER_URL}/group/addMem`,
      {
        memberIds: selectedFriendsToAdd,
        chatId : selectedChat._id
      },
      { withCredentials: true }
    );
    
    if (response.data && response.data.success) {
      // Refresh chat details
      fetchChatDetails(selectedChat._id);
      
      // Close the add members modal
      setShowAddMembers(false);
      setSelectedFriendsToAdd([]);
      
      // Optionally show a success message
      // toast.success("Members added successfully");
    }
  } catch (error) {
    console.error("Error adding members:", error);
    setAddMemberError(error.response?.data?.message || "Failed to add members. Please try again.");
  } finally {
    setAddingMembers(false);
  }
};

const fetchAvailableFriends = async () => {
  try {
    setLoadingFriends(true);
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/users/getAllFriends`,
      { withCredentials: true }
    );
    
    if (response.data && response.data.success) {
      // Filter out friends who are already in the group
      const existingMemberIds = chatDetails?.members?.map(member => member._id) || [];
      const availableFriends = response.data.data.filter(
        friend => !existingMemberIds.includes(friend._id)
      );
      
      setAvailableFriends(availableFriends);
    }
  } catch (error) {
    console.error("Error fetching friends:", error);
    setAddMemberError("Could not load your friends. Please try again.");
  } finally {
    setLoadingFriends(false);
  }
};

  const handleRemoveMember = async (memberId) => {
    if (!selectedChat?._id) return;
    setRemoveLoading(memberId);
    setRemoveError(null);
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/group/removeMem`,
        { memberId, chatId: selectedChat._id },
        { withCredentials: true }
      );
      // Refresh chat details to reflect removal
      // await fetchChatDetails(selectedChat._id);
    } catch (err) {
      console.log(err);
      setRemoveError(err.response?.data?.message || "Failed to remove member");
    } finally {
      setRemoveLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  // Loading state
  if (chatsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading chats...</p>
        </div>
      </div>
    )
  }

  // 7. Main component render
  return (
    <div className="flex flex-1">
      {/* Left sidebar - users list */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          {/* Filter Buttons */}
          <div className="mt-3 flex space-x-2">
            <button
              className={`w-9 h-6 rounded-full flex items-center justify-center text-xs font-semibold shadow transition ${
                filter === 'all'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`w-12 h-6 rounded-full flex items-center justify-center text-xs font-semibold shadow transition ${
                filter === 'groups'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => {
                setFilter('groups')
              }}
            >
              Groups
            </button>
            <button
              className={`w-12 h-6 rounded-full flex items-center justify-center text-xs font-semibold shadow transition ${
                filter === 'friends'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => {
                setFilter('friends')
              }}
            >
              Friends
            </button>
          </div>
        </div>

        {/* Users List */}
          <div className="flex-1 overflow-hidden">
            <div className="overflow-y-auto h-full ultra-thin-scrollbar hide-scrollbar-inactive">
              {users.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
            <p>No conversations yet</p>
                </div>
              ) : (
                users.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedChat(user)}
              className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                selectedChat && selectedChat._id === user._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {user.groupChat ? (
              <img src={`https://img.freepik.com/premium-vector/three-user-icon-vector-image-can-be-used-ui_120816-327771.jpg`} alt={user.name || 'User'} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
              <img src={user?.avatar} alt={user.name || 'User'} className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status || 'offline')}`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name || user.fullName || 'Unknown User'}</p>
              {user.lastMessageTime && (
                <p className="text-xs text-gray-500">{user.lastMessageTime}</p>
              )}
                  </div>
                  {user.lastMessage && (
              <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
                  )}
                </div>
                {user.unreadCount && user.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {user.unreadCount}
                  </span>
                )}
              </div>
            </div>
                ))
              )}
            </div>
          </div>
              </div>

              {/* Chat area - fixed layout with explicit heights */}
      <div className="flex-1 flex flex-col">
        {/* Chat header - show different content based on whether a chat is selected */}
        <div className="shrink-0 p-4 border-b border-gray-200 bg-white relative">
          {selectedChat ? (
            // Show full header with user info and icons when a chat is selected
            <div className="flex items-center space-x-3">
              <div className="relative">
                {/* Avatar is no longer clickable */}
                {selectedChat.avatar ? (
                  <img 
                    src={selectedChat.avatar} 
                    alt={selectedChat.name || 'User'} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">
                      {selectedChat.name ? selectedChat.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedChat.status || 'offline')}`}></span>
              </div>
              <div className="relative">
                {/* Make username clickable to toggle user details popup and fetch details */}
                <button 
                  ref={userButtonRef}
                  onClick={() => {
                    if (!showUserInfoPopup) {
                      fetchChatDetails(selectedChat._id);
                    } else {
                      setShowUserInfoPopup(false);
                    }
                  }}
                  className="flex flex-col items-start focus:outline-none"
                >
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    {selectedChat.name || 'Unknown User'}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">{selectedChat.status || 'offline'}</p>
                </button>
                
                {/* Enhanced user info popup with chat details */}
                {showUserInfoPopup && (
                  <div 
                    ref={popupRef}
                    className={`absolute left-0 top-full mt-1 ${
                      selectedChat.groupChat ? 'w-96' : 'w-72'
                    } bg-white rounded-lg shadow-lg z-10 border border-gray-200`} // Changed from dark to light theme
                  >
                    <div className="p-4 text-gray-800"> {/* Changed from text-white to text-gray-800 */}
                      {isLoadingDetails ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div> {/* Changed border color */}
                        </div>
                      ) : selectedChat.groupChat ? (
                        // Group chat content
                        <>
                          <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2"> {/* Changed bg color */}
                              <span className="text-gray-600 text-4xl"> {/* Changed text color */}
                                {chatDetails?.name ? chatDetails.name.charAt(0).toUpperCase() : 'G'}
                              </span>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900"> {/* Changed text color */}
                              {chatDetails?.name}
                            </h3>
                            <p className="text-sm text-gray-600">{chatDetails?.members?.length || 0} members</p> 
                          </div>
                          
                          {/* Group members with thin scrollbar */}
                          {chatDetails?.members && (
                            <div className="mt-4">
                              <h5 className="font-medium mb-2 text-sm">Members</h5>
                              <div className="max-h-40 overflow-y-auto ultra-thin-scrollbar hide-scrollbar-inactive">
                                {/* Current user first with "You" label */}
                                {chatDetails.members
                                  .filter(member => member._id === currentUser.id)
                                  .map(member => (
                                    <div key={member._id} className="flex items-center space-x-3 py-2 bg-gray-100 rounded mb-2 px-2"> 
                                      <div className="relative"> 
                                        {member.avatar ? (
                                          <img 
                                            src={member.avatar} 
                                            alt="You" 
                                            className="w-8 h-8 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 text-xs">
                                              {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                                            </span>
                                          </div>
                                        )}
                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status || 'offline')}`}></span>
                                      </div>
                                      <span className="text-sm font-medium text-gray-800">You</span>
                                      {member._id === chatDetails.creator && (
                                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full ml-auto">
                                          Admin
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                  
                                {/* Other members */}
                                {chatDetails.members
                                  .filter(member => member._id !== currentUser.id)
                                  .map(member => (
                                    <div key={member._id} className="flex items-center space-x-3 py-2">
                                      <div className="relative">
                                        {member.avatar ? (
                                          <img 
                                            src={member.avatar} 
                                            alt={member.name || member.fullName} 
                                            className="w-8 h-8 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-600 text-xs"> {/* Changed text color */}
                                              {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                                            </span>
                                          </div>
                                        )}
                                        {/* Add status badge */}
                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status || 'offline')}`}></span>
                                      </div>
                                      <span className="text-sm truncate text-gray-800">{member.name || member.fullName}</span> {/* Changed text color */}
                                      {member._id === chatDetails.creator && (
                                        <span className="text-md bg-blue-500 text-black pl-4 py-1 rounded-full ml-auto">
                                          Admin
                                        </span>
                                      )}
                                      {chatDetails?.creator === currentUser.id && member._id !== chatDetails.creator && (
                                        <button
                                          className="ml-auto text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                                          onClick={() => handleRemoveMember(member._id)}
                                          disabled={removeLoading === member._id}
                                          title="Remove from group"
                                        >
                                          {removeLoading === member._id ? "Removing..." : "Remove"}
                                        </button>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Group actions */}
                          <div className="mt-4 pt-2 border-t border-gray-200 space-y-2">
                            {chatDetails?.createdAt && (
                              <p className="text-xs text-gray-500">
                                Created {new Date(chatDetails.createdAt).toLocaleDateString()}
                              </p>
                            )}
                            
                            {/* Only show Add Members button if user is creator/admin */}
                            {chatDetails?.creator === currentUser.id && (
                              <button 
                                onClick={() => {
                                  setShowAddMembers(true);
                                  fetchAvailableFriends();
                                }}
                                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                                </svg>
                                <span>Add Members</span>
                              </button>
                            )}
                            
                            {/* Only show Edit Group button if user is creator */}
                            {chatDetails?.creator === currentUser.id && (
                              <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors">
                                Edit Group
                              </button>
                            )}
                            
                            {/* Only show Delete Group button if user is creator */}
                            {chatDetails?.creator === currentUser.id ? (
                              <button 
                                className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors delete-chat-btn"
                                onClick={handleDeleteChat}
                              >
                                Delete Group
                              </button>
                            ) : (
                              <button className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors">
                                Leave Group
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        // Direct message content - also update the theme
                        <>
                          <div className="flex flex-col items-center">
                            {selectedChat.avatar ? (
                              <img 
                                src={selectedChat.avatar} 
                                alt={selectedChat.name} 
                                className="w-24 h-24 rounded-full object-cover mb-2"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2"> {/* Changed bg color */}
                                <span className="text-gray-600 text-4xl"> {/* Changed text color */}
                                  {selectedChat.name ? selectedChat.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                            )}
                            <h3 className="text-xl font-medium text-gray-900"> {/* Changed text color */}
                              {selectedChat.name || 'Unknown User'}
                            </h3>
                            <h6 className="text-sm font-light text-gray-900">
                              {`~${chatDetails.username}` || '~username'}
                            </h6>
                           
                          </div>
                          
                          <div className="mt-4 flex justify-around">
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex flex-col items-center"> {/* Changed colors */}
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                              <span className="mt-1 text-xs">Video</span>
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex flex-col items-center"> {/* Changed colors */}
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="mt-1 text-xs">Voice</span>
                            </button>
                          </div>
                          
                          {/* Rest of direct message popup content with updated theme */}
                          <div className="mt-5">
                            <div className="flex justify-between items-center text-sm mb-2">
                              <span>About</span>
                              <span>{chatDetails?.about || selectedChat.about || 'At work'}</span>
                            </div>
                            
                            {(selectedChat.phoneNumber || chatDetails?.phoneNumber) && (
                              <div className="flex justify-between items-center text-sm mb-2">
                                <span>Phone number</span>
                                <span>{chatDetails?.phoneNumber || selectedChat.phoneNumber}</span>
                              </div>
                            )}
                            
                            {/* Add additional info from chat details */}
                            {chatDetails && chatDetails.createdAt && (
                              <div className="flex justify-between items-center text-sm mb-2">
                                <span>Created</span>
                                <span>{new Date(chatDetails.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                           
                            
                            <div className="flex justify-between items-center text-sm mb-2">
                              <div>
                                <span>Advanced chat privacy</span>
                                <p className="text-xs text-gray-400">This setting can only be updated on your phone.</p>
                              </div>
                              <span className="ml-2">Off</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                              <span>Mute notifications</span>
                              <div className="w-10 h-5 bg-gray-600 rounded-full relative">
                                <div className="absolute left-1 top-1 w-3 h-3 rounded-full bg-white"></div>
                              </div>
                            </div>
                            
                            {/* Add action buttons */}
                            <div className="mt-4 pt-4 border-t border-gray-700">
                              <button 
                              onClick={handleDeleteChat}
                              className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors">
                                Delete Chat
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
              </div>
              <div className="ml-auto flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">Select a conversation</h3>
            </div>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0">
            <MessageHandler 
              messages={messages} 
              selectedChat={selectedChat} 
              onLoadMoreMessages={loadMoreMessages}
              isLoadingOldMessages={isLoadingOldMessages}
              currentPage={currentPage}
              totalPages={totalPages}  // Add this prop
            />
          </div>
        </div>

        {/* Input area */}
        {selectedChat && (
          <div className="shrink-0 bg-white">
            {/* File preview - add debugging */}
            {filePreview ? (
              <FilePreview 
                file={filePreview.file}
                onCancel={handleCancelFileUpload}
                onSend={handleSendFile}
              />
            ) : (
              <div className="hidden">No file preview</div>
            )}
            
            {/* Show attachment error if any */}
            {attachmentErrors && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {attachmentErrors}
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSendMessage} className="flex space-x-2 p-4 border-t border-gray-200">
              {/* Keep the paperclip dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  aria-controls="attachment-menu"
                  aria-expanded={showAttachmentMenu ? "true" : "false"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                  </svg>
                </button>
                
                {/* Attachment menu dropdown */}
               {showAttachmentMenu && (
  <div 
    ref={attachmentMenuRef}
    className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-10"
  >
    <AttachmentHandler
      onFileSelect={handleFileSelect}
      onUploadStart={handleUploadStart}
      onUploadProgress={handleUploadProgress}
      onUploadSuccess={handleUploadSuccess}
      onUploadError={handleUploadError}
      selectedChat={selectedChat}
    />
  </div>
)}
      </div>
      
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={!newMessage.trim() && pendingAttachments.length > 0}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
        </svg>
      </button>
    </form>
  </div>
)}
    </div>
    {/* Custom Delete Confirmation Popup */}
{showDeleteConfirm && (

  <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-50">
    <div 
      ref={deletePopupRef}
      className="bg-white rounded-lg shadow-xl overflow-hidden w-80 transform transition-all animate-scale-in"
      style={{animation: 'scale-in 0.2s ease-out'}}
    >
      <div className="p-5">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete {selectedChat?.groupChat ? "Group" : "Chat"}?</h3>
        <p className="text-center text-gray-600 mb-6">
          This action cannot be undone and all messages will be permanently deleted.
        </p>
        
        {deleteError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            {deleteError}
          </div>
        )}
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            disabled={deleteLoading}
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteChat}
            className="flex-1 py-2 bg-red-600 rounded-md text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </div>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Add Members Modal */}
{showAddMembers && (
  <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-10">
    <div 
      ref={addMembersRef}
      className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10 flex flex-col"
      style={{maxHeight: '90vh'}}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Add Group Members</h3>
        <button 
          onClick={() => setShowAddMembers(false)}
          className="text-gray-400 hover:text-gray-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      {/* Search bar */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search members"
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      
      {/* Friend list */}
      <div className="flex-1 overflow-y-auto p-6">
        {addMemberError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {addMemberError}
          </div>
        )}
        
        {loadingFriends ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : availableFriends.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>No friends available to add</p>
          </div>
        ) : (
          <div className="space-y-1">
            {availableFriends.map(friend => (
              <div 
                key={friend._id} 
                onClick={() => toggleFriendSelection(friend._id)}
                className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                  selectedFriendsToAdd.includes(friend._id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <img
                    src={friend.avatar || "https://via.placeholder.com/40"}
                    alt={friend.fullName || friend.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(friend.status || 'offline')}`}></span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {friend.fullName || friend.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {friend.status || 'offline'}
                  </p>
                </div>
                <div className="ml-auto">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedFriendsToAdd.includes(friend._id) 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-400'
                  }`}>
                    {selectedFriendsToAdd.includes(friend._id) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleAddMembers}
          className="px-6 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          disabled={selectedFriendsToAdd.length === 0 || addingMembers}
        >
          {addingMembers ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : (
            `Add ${selectedFriendsToAdd.length > 0 ? `(${selectedFriendsToAdd.length})` : ''}`
          )}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}



export default Chat





