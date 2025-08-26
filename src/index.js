//require ('dotenv').config({path:'./env'})
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
//import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import {app} from './app.js'

dotenv.config({
    path:'./env'
})
//const app = express(); 


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port  : ${process.env.PORT}`);
    })
})
.catch((err)=>{
       console.log("MONGO DB CONNECTION FAILED !!!" , err) ;
    }
)








/*import express from "express"

( async ()=> {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("ERROR:",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listing on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR:",error)
        throw error
        
    }
})()*/