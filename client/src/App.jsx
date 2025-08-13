import React from 'react'
import {BrowserRouter as Router , Routes , Route, Navigate} from 'react-router-dom'
import Home from './pages/Home.jsx'
import Chat from './pages/Chat.jsx'
import Login from './pages/Login.jsx'
import Logout from './pages/Logout.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { SocketProvider } from './socket/socket.jsx'
import './styles/thin-scrollbar.css';
import Help from './pages/Help.jsx'
import NotFound from './pages/NotFound.jsx'


function App() {

  const SocketRoute = ({element})=>(
    <SocketProvider>
      {element}
    </SocketProvider>
  );

  return (
    <Router>
      <Routes>

        <Route path='/' element={<SocketRoute element={<Home/>}/>}>
          <Route path='home' Component={Home} />
          <Route path='chat' Component={Chat}></Route>
        </Route>

        <Route path='/login' Component={Login} />
        <Route path='/logout' Component={Logout} />
        <Route path='/signup' Component={Signup} />
        <Route path='/help' Component={Help}></Route>
        <Route path='*'   Component={NotFound}></Route>
      </Routes>
    </Router>
  )
}

export default App
