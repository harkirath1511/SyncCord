import io from 'socket.io-client'
import { createContext, useContext, useMemo } from 'react'
import React from 'react';

const SocketContext = createContext();

const getSocket = ()=> {
    return useContext(SocketContext);
}

const SocketProvider = ({children})=>{
const socket = useMemo(()=>{
    return io(`http://localhost:8000`, {withCredentials : true});
}, [])

    return(
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export {SocketProvider,getSocket }
