import express from 'express'
import {connectToDb} from './src/db/db.js'
import dotenv from 'dotenv';
import { app, server, io } from './app.js';


dotenv.config();


connectToDb()
.then((result) => {
    app.on("error", (err)=>{
        console.log(err)
        throw err
    })
    server.listen(process.env.PORT, ()=>{
        console.log("Server is listening on port ", process.env.PORT)
    })
})
.catch((err)=>{
    console.log(`DB connection error : ${err}`)
})


