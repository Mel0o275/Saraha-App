import express from 'express'
import { port } from '../config/config.service.js'
import authRouter from './modules/Auth/auth.controllers.js'
import userRouter from './modules/User/user.controller.js'
import adminRouter from './modules/admin/admin.controller.js'
import messageRouter from './modules/message/message.controllers.js'
import cors from 'cors'
import { connectRedis } from './db/radis.connection.js'
import { deleteUnconfirmedUsersJob } from './common/cron/delete.cron.js'
import helmet from 'helmet'

async function bootstrap() {
    const app = express()
    await connectRedis()
    app.use(cors(), helmet(),express.json())    
    app.get('/', (req, res) => res.send('Hello World!'))
    app.set('trust proxy', 1) // trust first proxy

    app.use('/users',authRouter)
    app.use('/users',userRouter)
    app.use('/admin',adminRouter)
    app.use('/message',messageRouter)
    deleteUnconfirmedUsersJob()
    // app.use("/uploads", express.static("uploads"));

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