import React, { useState, useEffect } from 'react'
import axios from 'axios'
import auth from '../utils/auth.js'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState({})
  
  const navigate = useNavigate()
  const checkAuth = auth()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/users/user-details`, {
          withCredentials: true
        })
        setCurrentUser({
          id: res.data.data.user._id,
          name: res.data.data.user.fullName,
          email: res.data.data.user.email,
          username: res.data.data.user.username,
          avatar: res.data.data.user.avatar,
          joinedDate: new Date(res.data.data.user.createdAt).toLocaleDateString(
            'en-US', { 
              month: 'long', 
              year: 'numeric' 
            })
        })
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Profile Header */}
      <div className="p-6 text-center border-b border-gray-200">
        <div className="relative inline-block">
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-20 h-20 rounded-full object-cover mx-auto" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
              <span className="text-gray-600 font-medium text-xl">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
          <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(currentUser.status || 'online')}`}></span>
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900">{currentUser.name}</h3>
        <p className="text-sm text-gray-500">{currentUser.username}</p>
        <p className="text-xs text-gray-400 mt-1">{currentUser.email}</p>
      </div>

      {/* Profile Details */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          {/* Bio Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">About</h4>
            <p className="text-sm text-gray-600">{currentUser.bio || 'No bio available'}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">124</p>
              <p className="text-xs text-gray-500">Conversations</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">1.2k</p>
              <p className="text-xs text-gray-500">Messages</p>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-3">
            {currentUser.location && (
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-sm text-gray-600">{currentUser.location}</span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="text-sm text-gray-600">Joined {currentUser.joinedDate}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200">
              Edit Profile
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-200">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
