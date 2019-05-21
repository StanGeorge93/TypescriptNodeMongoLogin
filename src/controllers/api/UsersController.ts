import { BaseController } from './BaseController'
import { UserModel } from '../../schemas/user'
import express from "express"
import createLogger from "../../logger/logger"

import validateRegisterInput from "../../utils/register"
import validateLoginInput from "../../utils/login"
const logger = createLogger("User Controller")(console.log)

export default class UsersController extends BaseController {
  protected schema = UserModel

  constructor() {
    super()

  }

  public me(req: express.Request, res: express.Response) {
    logger("REQ", req.body)
    this.sendResponse(res, "Dummy");
  }

  public async register(req: express.Request, res: express.Response) {
    const { errors, isValid } = validateRegisterInput(req.body)

    try {
      if (!isValid) {
        throw errors
      }

      const user = await this.schema.findOne({ email: req.body.email })

      if (user) {
        throw 'Email already exists'
      }

      const newUser = new this.schema(req.body)
      const data = await newUser.save()

      this.sendResponse(res, data)


    } catch (error) {
      this.sendError(res, error)
    }
  }

  public async login(req: express.Request, res: express.Response) {
    const { email, password } = req.body
    const { errors, isValid } = validateLoginInput(req.body)

    try {
      if (!isValid) {
        throw errors
      }

      const user = await this.schema.findByCredentials(email, password)
      const token = await user.generateAuthToken()
      res.header('x-auth', token)

      logger("Login successful", user.email)

      this.sendResponse(res, {
        email: user.email,
        token: `Bearer ${token}`
      })

    } catch (err) {
      this.sendError(res, err)
    }
  }
}
