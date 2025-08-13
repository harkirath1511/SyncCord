import React, { useState, useEffect, useRef } from 'react' // Add useRef import
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import NewGroupHandler from '../helper/NewGroupHandler';

function Header({ currentUser, toggleDashboard }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [sendingReqId, setSendingReqId] = useState(null);
  const [reqSuccess, setReqSuccess] = useState(null);
  const [reqMessage, setReqMessage] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.name || '',
    username: currentUser?.username || ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || '');

  // Update profile form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        fullName: currentUser.name || '',
        username: currentUser.username || ''
      });
      setAvatarPreview(currentUser.avatar || '');
    }
  }, [currentUser]);

  useEffect(() => {
    const getNotifications = async() => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/request/getMyReqs`, {
          withCredentials: true
        });
        
        if (res.data && res.data.data) {
          const formattedRequests = res.data.data.map(req => ({
            id: req._id || req.id,
            type: 'friend',
            from: req.sender?.fullName || 'Someone',
            avatar: req.sender?.avatar || 'https://via.placeholder.com/40',
            content: 'sent you a friend request',
            time: formatTimestamp(req.createdAt || new Date()),
            isRead: false,
            originalData: req
          }));
          
          setFriendRequests(formattedRequests);
        }
      } catch (error) {
        console.log("Error fetching friend requests:", error);
      }
    };
    
    getNotifications();
  }, []);

  // Helper function to format timestamps
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSecs < 60) return 'just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.log("Date formatting error:", error);
      return 'recently';
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_SERVER_URL}/request/acceptReq`, 
        { reqId: requestId, accept: true }, 
        { withCredentials: true }
      );
      
      if (res.data && res.data.success) {
        setFriendRequests(prevRequests => 
          prevRequests.filter(req => req.id !== requestId)
        );
      }
    } catch (error) {
      console.log("Error accepting friend request:", error);
    }
  };

  // Reject friend request
  const handleRejectRequest = async (requestId) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_SERVER_URL}/request/acceptReq`, 
        { reqId: requestId, accept: false }, 
        { withCredentials: true }
      );
      
      if (res.data && res.data.success) {
        setFriendRequests(prevRequests => 
          prevRequests.filter(req => req.id !== requestId)
        );
      }
    } catch (error) {
      console.log("Error rejecting friend request:", error);
    }
  };

  // Change password form handling
  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  // Profile form handling
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit change password
  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setSuccessMessage('');
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/users/change-password`,
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        },
        { withCredentials: true }
      );
      
      if (res.data && res.data.statusCode === 200) {
        setSuccessMessage("Password changed successfully!");
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowChangePassword(false);
          setSuccessMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error("Password change error:", error.response?.data?.message || error.message);
      setPasswordError(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit profile update
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setSuccessMessage('');
    
    try {
      setIsLoading(true);
      
      // Update user details
      const detailsResponse = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/users/update-profile`,
        {
          fullName: profileForm.fullName,
          username: profileForm.username
        },
        { withCredentials: true }
      );
      
      // If avatar was changed, update it
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        await axios.patch(
          `${import.meta.env.VITE_SERVER_URL}/users/update-avatar`,
          formData,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      setSuccessMessage("Profile updated successfully!");
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowUpdateProfile(false);
        setSuccessMessage('');
        // Refresh page to see updated profile
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error("Profile update error:", error.response?.data?.message || error.message);
      setProfileError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/users/logout`, {
        withCredentials: true
      });

      if (res.data.statusCode === 200) {
        console.log('Logged out successfully');
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
      setIsDropdownOpen(false);
    }
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  };

  const openChangePassword = () => {
    setShowChangePassword(true);
    setIsDropdownOpen(false);
  };

  const openUpdateProfile = () => {
    setShowUpdateProfile(true);
    setIsDropdownOpen(false);
  };

  // Handler for Users icon
  const handleShowAllUsers = async () => {
    setShowAllUsers(true);
    setLoadingAllUsers(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/users/getAllUsers`, {
        withCredentials: true
      });
      setAllUsers(res.data.data || []);
    } catch (error) {
      setAllUsers([]);
    }
    setLoadingAllUsers(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Search handler
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setSearchResults([]);
      setSearchDropdownOpen(false);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/users/getAllUsers`, {
          withCredentials: true
        });
        const all = res.data.data || [];
        const filtered = all.filter(user =>
          (user.fullName || user.username || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
        setSearchDropdownOpen(true);
      } catch (error) {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, 400); // debounce

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const notifications = friendRequests;

const handleSendRequest = async (secUserId) => {

  setSendingReqId(secUserId);
  setReqSuccess(null);
  setReqMessage('');
  try {
    await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/request/sendReq`,
      { secUserId },
      { withCredentials: true }
    );
    setReqSuccess(secUserId);
    setReqMessage('Request sent successfully!');
  } catch (error) {
    console.log(error)
    setReqSuccess(false);
    setReqMessage(
      error?.response?.data?.message ||
      'Failed to send request. Please try again.'
    );
  }
  setSendingReqId(null);
};

const openHelpPage = ()=>{
  navigate('/help')
};

const handleToggleDashboard = ()=>{
  toggleDashboard(),
  setIsDropdownOpen(!isDropdownOpen);
}

  // Create refs for dropdowns
  const dropdownRef = useRef(null);
  const searchDropdownRef = useRef(null);

  // Handle clicks outside of dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      // Close user dropdown if clicked outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      
      // Close search dropdown if clicked outside
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setSearchDropdownOpen(false);
      }
    }
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Left Side - Logo and App Name */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">ChatApp</h1>
                  <p className="text-xs text-gray-500">Stay connected</p>
                </div>
              </div>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onFocus={() => searchTerm && setSearchDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setSearchDropdownOpen(false), 200)}
                />
                <svg className="absolute left-4 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                {/* Search Results Dropdown */}
                {searchDropdownOpen && (
                  <div 
                    ref={searchDropdownRef}
                    className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto"
                  >
                    {searchLoading ? (
                      <div className="p-4 text-center text-gray-500">Searching...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No users found.</div>
                    ) : (
                      searchResults.map(user => (
                        <div key={user._id} className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 transition">
                          <img
                            src={user.avatar || "https://via.placeholder.com/40"}
                            alt={user.fullName || user.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.fullName || user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Notifications and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button onClick={handleNotifications} className="relative p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100 transition duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19.5A2.5 2.5 0 016.5 17H20a2 2 0 002-2V7a2 2 0 00-2-2H6.5A2.5 2.5 0 014 7.5v12z"></path>
                </svg>
                {friendRequests.length > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {friendRequests.length}
                  </span>
                )}
              </button>

              {/*Users Icon*/ }
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 transition duration-200 flex items-center justify-center"
                aria-label="Users"
                onClick={handleShowAllUsers}
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Settings */}
              <button 
                className="p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100 transition duration-200 relative group"
                aria-label="Create new group"
                onClick={() => setShowNewGroup(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  New Group
                </span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  <div className="relative">
                    <img
                      src={currentUser?.avatar || ''}
                      alt={currentUser?.name || ''}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(currentUser?.status)}`}></span>
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{currentUser?.name || ''}</p>
                    <p className="text-xs text-gray-500 capitalize">{currentUser?.status || ''}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div 
                    ref={dropdownRef} 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{currentUser?.name || ''}</p>
                      <p className="text-sm text-gray-500">{currentUser?.email || ''}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button 
                        onClick={handleToggleDashboard}  // Add this line
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        Profile
                      </button>
                      <button 
                        onClick={openChangePassword} 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        Change Password
                      </button>
                      <button 
                        onClick={openUpdateProfile}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Update Profile
                      </button>
                      <button onClick={openHelpPage} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Help & Support
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <svg className="w-4 h-4 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                          </svg>
                        )}
                        {isLoading ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Modal with Blurred Background */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-opacity-30 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          ></div>
          
          {/* Notifications Panel */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">Friend Requests</h3>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {friendRequests.length} new
                </span>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {friendRequests.length === 0 ? (
                <div className="py-8 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  <p className="text-gray-500">No friend requests yet</p>
                </div>
              ) : (
                <div>
                  {friendRequests.map(request => (
                    <div 
                      key={request.id}
                      className="p-4 border-b border-gray-100 hover:bg-gray-50 transition duration-150"
                    >
                      <div className="flex items-start space-x-3">
                        <img 
                          src={request.avatar || "https://via.placeholder.com/40"} 
                          alt={request.from} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {request.from}
                              </p>
                              <p className="text-sm text-gray-600 mt-0.5">
                                {request.content}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {request.time}
                            </span>
                          </div>
                          
                          {/* Friend request actions */}
                          <div className="mt-3 flex space-x-2">
                            <button 
                              onClick={() => handleAcceptRequest(request.id)}
                              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleRejectRequest(request.id)}
                              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded transition"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0  bg-opacity-30 backdrop-blur-sm"
            onClick={() => setShowChangePassword(false)}
          ></div>
          
          {/* Change Password Panel */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button 
                onClick={() => setShowChangePassword(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmitPassword} className="p-6">
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {passwordError}
                </div>
              )}
              
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
                  {successMessage}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading && (
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Profile Modal */}
      {showUpdateProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0  bg-opacity-30 backdrop-blur-sm"
            onClick={() => setShowUpdateProfile(false)}
          ></div>
          
          {/* Update Profile Panel */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Update Profile</h3>
              <button 
                onClick={() => setShowUpdateProfile(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmitProfile} className="p-6">
              {profileError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {profileError}
                </div>
              )}
              
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
                  {successMessage}
                </div>
              )}
              
              {/* Avatar */}
              <div className="mb-6 flex flex-col items-center">
                <div className="relative">
                  <img 
                    src={avatarPreview || "https://via.placeholder.com/100"} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                  <label htmlFor="avatar" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <input 
                      type="file" 
                      id="avatar" 
                      name="avatar"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden" 
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">Click the icon to change your profile picture</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={profileForm.fullName}
                    onChange={handleProfileChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileForm.username}
                    onChange={handleProfileChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUpdateProfile(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading && (
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* All Users Modal */}
      {showAllUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred backdrop */}
          <div
            className="fixed inset-0  bg-opacity-30 backdrop-blur-sm"
            onClick={() => setShowAllUsers(false)}
          ></div>
          {/* Modal box */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative z-10 max-h-[80vh] overflow-y-auto flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
              <button
                onClick={() => setShowAllUsers(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {reqMessage && (
                <div className={`mb-4 p-3 rounded text-sm font-medium ${
                  reqSuccess === false
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {reqMessage}
                </div>
              )}
              {loadingAllUsers ? (
                <div className="text-center text-gray-500">Loading users...</div>
              ) : allUsers.length === 0 ? (
                <div className="text-center text-gray-500">No users found.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {allUsers.map(user => (
                    <div key={user._id} className="flex items-center space-x-3 p-3 rounded hover:bg-gray-50 transition">
                      <img
                        src={user.avatar || "https://via.placeholder.com/40"}
                        alt={user.fullName || user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{user.fullName || user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        className={`px-3 py-1 text-xs font-medium rounded transition ${
                          reqSuccess === user._id
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        disabled={sendingReqId === user._id}
                        onClick={() => handleSendRequest(user._id)}
                      >
                        {sendingReqId === user._id
                          ? 'Sending...'
                          : reqSuccess === user._id
                          ? 'Sent!'
                          : 'Send Request'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={() => setShowAllUsers(false)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Group Modal */}
      {showNewGroup && (
        <NewGroupHandler 
          isOpen={showNewGroup}
          onClose={() => setShowNewGroup(false)}
          currentUser={currentUser}
        />
      )}
    </>
  )
}

export default Header
