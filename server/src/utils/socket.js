import { socketIDs } from "../../app.js";
import { io } from "../../app.js";



export const getSocketIDs = (users)=>{

    const sockets = users.map((user)=> 
        socketIDs.get(user.toString())
    );

    return sockets;
};

export const emitEvent = (req, event , users, data)=>{

    const socketIds = getSocketIDs(users);
    const io = req.app.get('io');

    io.to(socketIds).emit(event, data);
    
};
