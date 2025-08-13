import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import {createServer} from 'http'
import { NEW_ATTACHEMENTS, NEW_MESSAGE, NEW_MESSAGE_ALERT } from './constants/constants.js';
import { getSocketIDs } from './src/utils/socket.js';
import { SocketAuthunticator } from './src/middlewares/auth.middleware.js';
import { Message } from './src/models/message.model.js';

const socketIDs = new Map()

const app = express();
const server = createServer(app)
const io = new Server(server, {
    cors : {
        origin : process.env.ALLOWED_ORIGIN,
        credentials : true
    }
});

app.set('io', io);

app.use(cors({
    origin : process.env.ALLOWED_ORIGIN,
    credentials : true
}));
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({extended : true, limit : "20kb"}));
app.use(cookieParser());


//Routes 
import userRouter from './src/routes/User.routes.js'
import chatRouter from './src/routes/Chat.routes.js'
import groupRouter from './src/routes/Group.routes.js'
import messageRouter from './src/routes/Message.routes.js'
import requestRouter from './src/routes/Request.routes.js'
import { authHandler } from './src/utils/auth.js';



app.get('/api/v1/auth', authHandler);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/group', groupRouter);
app.use('/api/v1/message', messageRouter);
app.use('/api/v1/request', requestRouter);


io.use((socket, next)=>{
    cookieParser()
    (
        socket.request,
        socket.request.res, 
        async (err)=> SocketAuthunticator(err, socket, next)
    );
});


io.on("connection", (socket)=>{

    const user = socket?.user;

    socketIDs.set(user._id.toString(), socket.id);
    console.log(socketIDs);

    socket.on(NEW_MESSAGE, async (data)=>{
        const {message, chatId, members=[]} = data;

        const messageForRealTime = {
            content : message,
            id : Math.floor(Math.random()*200),
            sender : {
                _id : user._id,
                name : user.fullName,
                avatar : user?.avatar
            },
            chat : chatId,
            createdAt : new Date().toISOString()
        };

        const messageForDb = {
            content : message,
            sender : user._id,
            chat : chatId
        }
        
        const membersArr = members.map((mem)=> mem._id);
        const usersSockets = getSocketIDs(membersArr);

        io.to(usersSockets).emit(NEW_MESSAGE, {
            chatId,
            message : messageForRealTime  
        })
        io.to(usersSockets).emit(NEW_MESSAGE_ALERT, {
            chatId
        })

        await Message.create(messageForDb)

    });


    
    socket.on("disconnect", ()=>{
        console.log("User disconnected");
        socketIDs.delete(user._id.toString())
    })
});




export {app, server, io, socketIDs}
