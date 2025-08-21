import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    CredentialS :true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded9({extended:true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



export { app }