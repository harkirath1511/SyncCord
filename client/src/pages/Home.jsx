import React, { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import Dashboard from './Dashboard.jsx'
import Chat from './Chat.jsx'
import axios from 'axios'
import auth from '../utils/auth.js'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [currentUser, setCurrentUser] = useState({})
  const [isLoading, setIsLoading] = useState(true)
    const [showDashboard, setShowDashboard] = useState(false)

  const navigate = useNavigate()
  const checkAuth = auth();

    const toggleDashboard = () => {
    setShowDashboard(prev => !prev)
  }

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

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <Header currentUser={currentUser} toggleDashboard={toggleDashboard}/>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <Chat currentUser={currentUser} />
        
        {/* Dashboard/Profile Area */}
      </div>
       {showDashboard && (
          <div className="w-[320px] border-l border-gray-200">
            <Dashboard />
          </div>
        )}
    </div>
  )
}

export default Home
