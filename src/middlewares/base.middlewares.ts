import { Model } from "mongoose"

export default class BaseMiddleware {
  protected schema: Model<any>

  constructor() {

  }
}
