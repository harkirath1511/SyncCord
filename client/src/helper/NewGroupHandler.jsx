import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function NewGroupHandler({ isOpen, onClose, currentUser }) {
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const popupRef = useRef(null);

  // Fetch friends list when component mounts
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoadingFriends(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/users/getAllFriends`, 
          { withCredentials: true }
        );
        
        if (response.data && response.data.success) {
          setFriends(response.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError("Could not load your friends list. Please try again.");
      } finally {
        setLoadingFriends(false);
      }
    };

    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  // Handle clicks outside the popup to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Toggle friend selection
  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  // Handle group creation
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError("Please enter a group name");
      return;
    }

    if (selectedFriends.length === 0) {
      setError("Please select at least one friend");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/group/createGrp`,
        {
          name: groupName,
          members: selectedFriends
        },
        { withCredentials: true }
      );
      
      if (response.data && response.data.success) {
        setSuccess(true);
        // Reset the form
        setGroupName('');
        setSelectedFriends([]);
        
        // Close the popup after 2 seconds on success
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating group:", err);
      setError(err.response?.data?.message || "Failed to create group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0  bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div 
        ref={popupRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10 max-h-[90vh] flex flex-col"
        style={{animation: 'scale-in 0.2s ease-out'}}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Create New Group</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Success/Error Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
              Group created successfully!
            </div>
          )}
          
          {/* Group Name Input */}
          <div className="mb-6">
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {/* Friends List */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Select Friends to Add</h4>
            
            {loadingFriends ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : friends.length === 0 ? (
              <div className="py-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>You don't have any friends yet</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                <ul className="divide-y divide-gray-200">
                  {friends.map(friend => (
                    <li key={friend._id} className="px-4 py-3 hover:bg-gray-50 transition">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`friend-${friend._id}`}
                          checked={selectedFriends.includes(friend._id)}
                          onChange={() => toggleFriendSelection(friend._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`friend-${friend._id}`} className="ml-3 flex items-center cursor-pointer flex-1">
                          <img
                            src={friend.avatar || "https://via.placeholder.com/40"}
                            alt={friend.fullName || friend.username}
                            className="w-8 h-8 rounded-full object-cover mr-3"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {friend.fullName || friend.username}
                            </p>
                            {friend.status && (
                              <p className="text-xs text-gray-500 capitalize">
                                {friend.status}
                              </p>
                            )}
                          </div>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer with Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Group'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewGroupHandler;
