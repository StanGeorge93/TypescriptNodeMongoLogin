import express from 'express'
import bodyParser from 'body-parser'
import UserRouter from "../routes/user.router"
import createLogger from '../logger/logger'

const logger = createLogger("App")(console.log)

class App {
  public express: any

  constructor() {
    logger("App initializing")
    this.express = express()
    this.express.use(bodyParser.urlencoded({ extended: false }))
    this.express.use(bodyParser.json())
    
    this.mountRoutes()
  }

  private mountRoutes(): void {
    const apiRouter = express.Router()

    logger("MOUNTED ROUTES!")

    apiRouter.use('/api/v1/', (req, res, next) => {
      res.send("WATADFADA")
      logger("WORKS!")
    })

    this.express.use('/api/v1/users', UserRouter)
  }
}

export default new App().express
