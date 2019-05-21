import { UserModel } from '../schemas/user'
import { Model } from 'mongoose'
import BaseMiddleware from "./base.middlewares"
import express from "express"
import createLogger from "../logger/logger"

const logger = createLogger("User Middleware")(console.log)

export default class UserMiddlewares extends BaseMiddleware {
  protected schema = UserModel

  constructor() {
    super()
  }

  async isAuthenticate(req: any, res: express.Response, next: express.NextFunction) {
    const token = req.header('x-auth')

    try {
      const user = await this.schema.findByToken(token)
      req.user = user
      req.token = token

      next()

    } catch (error) {
      res.status(401).send("Unauthorized")
    }
  }
}
