import express from 'express'
import { port } from '../config/config.service.js'
import authRouter from './modules/Auth/auth.controllers.js'
import userRouter from './modules/User/user.controller.js'
import uploadeRouter from './modules/Upload Image/upload.controller.js'
import cors from 'cors'

async function bootstrap() {
    const app = express()
    app.use(cors(),express.json())    
    app.get('/', (req, res) => res.send('Hello World!'))

    app.use('/users',authRouter)
    app.use('/users',userRouter)
    app.use('/',uploadeRouter)
    app.use("/uploads", express.static("uploads"));

    // //invalid routing
    // app.use('{/*dummy}', (req, res) => {
    //     return res.status(404).json({ message: "Invalid application routing" })
    // })

    // //error-handling
    // app.use((error, req, res, next) => {
    //     const status = error.cause?.status ?? 500
    //     return res.status(status).json({
    //         error_message:
    //             status == 500 ? 'something went wrong' : error.message ?? 'something went wrong',
    //         stack: NODE_ENV == "development" ? error.stack : undefined
    //     })
    // })
    
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}
export default bootstrap