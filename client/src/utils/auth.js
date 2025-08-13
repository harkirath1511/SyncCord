import axios from "axios";
import { useNavigate } from "react-router-dom";


function auth() {
  const navigate = useNavigate();
  
  const checkAuth = async () => {
    try {
      const req = await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth`, {
        withCredentials: true
      });
      return req.data;
    } catch (error) {
      console.log(error);
      navigate('/login');
    }
  };
  
  return  checkAuth ;
}

export default auth;
