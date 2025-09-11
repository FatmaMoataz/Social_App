// import express, {type Express, type Request, type Response} from "express"
import {resolve} from 'node:path'
import {config} from 'dotenv'
config({path: resolve("./config/.env.development")})

import type {Express,  Request,  Response} from "express"
import express from "express"

import cors from "cors"
import helmet from "helmet"
import {rateLimit} from 'express-rate-limit'
import authController from './modules/auth/auth.controller'
import userController from './modules/user/user.controller'
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
app.use("/auth", authController)
app.use("/user", userController)

app.use(globalErrorHandling)

app.get("/uploads/*path", async(req:Request, res:Response):Promise<void> => {
    const {downloadName, download="false"} = req.query as {downloadName?:string, download?:string} 
    const {path} = req.params as unknown as {path:string[]}
    const Key = path.join("/")
    const s3Response = await getFile({Key})
    if(!s3Response?.Body) {
throw new BadRequest("Failed to fetch this asset")
    }
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
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);  
})
}

export default bootstrap