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
import { globalErrorHandling } from './modules/utils/response/error.response'

import connectDB from './DB/connection.db.js'

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

// invalid route
app.use("{/*dummy}",(req:Request, res:Response) => {return res.status(404).json({message:'Invalid routing'})})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);  
})
}

export default bootstrap