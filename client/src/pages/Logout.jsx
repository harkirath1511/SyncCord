import axios from 'axios'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function Logout() {
    const navigate = useNavigate();

    const handleLogout = async()=>{
        try {
            const res = await axios.get("http://localhost:8000/api/v1/users/logout", {
                withCredentials: true  
            });
            

            if(res.data.statusCode === 200){
                console.log('Logged out successfully');
                navigate('/home'); 
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

  return (
    <button
     className='bg-black text-xl text-white border-2 rounded-lg px-2 py-1 ml-60 mt-40 hover:bg-gray-800 transition-colors'
     onClick={handleLogout}
    >Logout now!</button>
  )
}

export default Logout
