import "reflect-metadata"
import app from './app/App'
import { PORT } from './config'
import createLogger from "./logger/logger"
const logger = createLogger("Server")(console.log)

app.listen(PORT, () => {
  logger(`running on port ${PORT}`)
})
