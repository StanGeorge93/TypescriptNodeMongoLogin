import { Router } from 'express'
import UserController from '../controllers/api/UsersController'
import UserMiddlewares from "../middlewares/user.middlewares"
import createLogger from "../logger/logger"
const logger = createLogger("Base Controller")(console.log)


export class UserRouter {
  public router: Router
  private userMiddlewares: any
  private userController: any

  constructor() {
    this.router = Router()
    this.userController = new UserController
    this.userMiddlewares = new UserMiddlewares

    this.init()
  }

  init() {
    this.router.post('/register', this.userController.register.bind(this.userController))
    this.router.post('/login', this.userController.login.bind(this.userController))
    this.router.get('/me', this.userMiddlewares.isAuthenticate.bind(this.userMiddlewares), this.userController.me.bind(this.userController))
  }
}

const userRoutes = new UserRouter()
userRoutes.init()

export default userRoutes.router
