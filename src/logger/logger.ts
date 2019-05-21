const createLogger =
  (repository: string) => (logger: Function) => (message: string, data: any = "") => {

    logger("---------------------")
    logger(repository + ":")
    logger(message)
    logger(data)
    logger("---------------------")
  }

export default createLogger
