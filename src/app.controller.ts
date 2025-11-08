import {resolve} from 'node:path'
import {config} from 'dotenv'
config({path: resolve("./config/.env.development")})

import type {Express,  Request,  Response} from "express"
import express from "express"

import cors from "cors"
import helmet from "helmet"
import {rateLimit} from 'express-rate-limit'

import {authRouter, userRouter, postRouter} from './modules'

import { BadRequest, globalErrorHandling } from './modules/utils/response/error.response'

import connectDB from './DB/connection.db.js'
import { createGetPreSignedLink, getFile} from './modules/utils/multer/s3.config'

import {promisify} from 'node:util'
import { pipeline } from 'node:stream'

const createS3WriteStreamPipe = promisify(pipeline)

const limiter = rateLimit({
    windowMs:60*6000,
    limit:2000,
    message:{error:"Too many request please try again later"}
})

import {Server, Socket} from 'socket.io'

const bootstrap = async():Promise<void> => {
const app:Express = express()
const port:number | string = process.env.PORT || 5000
app.use(cors(),express.json(),helmet())

app.use(limiter)
await connectDB()

// app-routing
app.get('/',(req:Request, res:Response) => {
    res.json({message:`Welcome to ${process.env.APPLICATION_NAME} backend landing page`})
})
// modules
app.use("/auth", authRouter)
app.use("/user", userRouter)
app.use("/post", postRouter)

app.use(globalErrorHandling)

app.get("/uploads/*path", async(req:Request, res:Response):Promise<void> => {
    const {downloadName, download="false"} = req.query as {downloadName?:string, download?:string} 
    const {path} = req.params as unknown as {path:string[]}
    const Key = path.join("/")
    const s3Response = await getFile({Key})
    if(!s3Response?.Body) {
throw new BadRequest("Failed to fetch this asset")
    }
    res.set("Cross-Origin-Resource-Policy" , "cross-origin")
    res.setHeader("Content-type", `${s3Response.ContentType || "application/octet-stream"}`)
    if(download === "true") {
    res.setHeader("Content-Disposition", `attachments: filename="${downloadName || Key.split("/").pop()}"`)
    }
return await createS3WriteStreamPipe(s3Response.Body as NodeJS.ReadableStream, res)
})

app.get("/uploads/pre-signed/*path", async(req:Request, res:Response):Promise<Response> => {
    const {downloadName, download="false", expiresIn=120} = req.query as {downloadName?:string, download?:string, expiresIn?:number} 
    const {path} = req.params as unknown as {path:string[]}
    const Key = path.join("/")
    const url = await createGetPreSignedLink({Key, download, downloadName: downloadName as string, expiresIn})
return res.json({message:"Done", data:{url}})
})

// invalid route
app.use("{/*dummy}",(req:Request, res:Response) => {return res.status(404).json({message:'Invalid routing'})})

const httpServer = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);  
})

const io = new Server(httpServer  , {
    cors: {
        origin:"*",
    }
})
// http://localhost:3000/
io.on("connection", (socket: Socket) => {
console.log(socket);
socket.on("disconnect" , () => {
    console.log(`logout from ${socket.id}`);
    
})
})

// http://localhost:3000/admin
io.of("/admin").on("connection", (socket: Socket) => {
console.log(`Admin`, socket.id);
socket.on("disconnect" , () => {
    console.log(`logout from ${socket.id}`);
    
})
})

}

export default bootstrap