import mongoose from 'mongoose'
import { Model } from 'mongoose'
import { DB_URI } from "../../config"
import createLogger from "../../logger/logger"
const logger = createLogger("Base Controller")(console.log)

export class BaseController {
  protected schema: Model<any>

  constructor() {
    this.init()
  }

  private async init() {
    try {
      await mongoose.connect(DB_URI, {
        useNewUrlParser: true
      })

      logger('Database connection successful!')
    } catch (err) {
      console.error('Database connection error')
    }
  }

  public async index(request, response) {
    try {
      const data = await this.schema.find()
      this.sendResponse(response, data)
    } catch (error) {
      logger("ERROR", error)
      this.sendError(response, error)
    }
  }

  public async show(request, response) {
    if (request.params.id) {
      try {
        const data = this.schema.findById(request.params.id)
        this.sendResponse(response, data)
      } catch (error) {
        logger("ERROR", error)
        this.sendError(response, error)
      }
    }
  }

  protected async store(request, response) {
    try {
      const data = await this.schema.create(request.body)
      this.sendResponse(response, data)
    } catch (validationError) {
      this.catchErrors(validationError, response)
    }
  }

  public async update(request, response) {
    if (request.params.id) {
      try {
        const data = this.schema.findByIdAndUpdate(request.params.id, request.body, { new: true })
        this.sendResponse(response, data)
      } catch (validationError) {
        this.catchErrors(validationError, response)
      }
    }
  }

  public async delete(request, response) {
    try {
      await this.schema.findByIdAndRemove(request.params.id)
      this.sendResponse(response, null)
    } catch (validationError) {
      this.catchErrors(validationError, response)
    }
  }

  protected catchErrors(validationError, response) {
    const errorMessages = []

    for (var errName in validationError.errors) {
      errorMessages.push(validationError.errors[errName].message)
    }

    response.status(422).send({
      success: false,
      errors: errorMessages,
    })
  }

  protected sendResponse(response: any, data: any) {
    response.status(200).send({
      'success': true,
      'data': data,
    })
  }

  protected sendError(response: any, err: any) {
    let error: string = err || "Unhandled error"
    let status: number = 422
    const success: boolean = !error

    if (err && err.code === 11000) {
      error = "User already exists"
      status = 409
    }

    console.log("ERR", error);

    response.status(status).send({
      success,
      error
    })
  }
}
