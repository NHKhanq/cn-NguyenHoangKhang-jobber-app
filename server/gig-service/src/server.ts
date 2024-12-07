import http from 'http'

import 'express-async-errors'
import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from 'jobber-shared-for-hkhanq'
import { Logger } from 'winston'
import { config } from '@gig/config'
import { Application, Request, Response, NextFunction, json, urlencoded } from 'express'
import hpp from 'hpp'
import helmet from 'helmet'
import cors from 'cors'
import { verify } from 'jsonwebtoken'
import compression from 'compression'
import { checkConnection } from '@gig/elasticsearch'
import { appRoutes } from '@gig/route'
// import { createConnection } from '@gig/queues/connection'
// import { consumeBuyerDirectMessage, consumeSellerDirectMessage } from '@gig/queues/user.consumer'
import { Channel } from 'amqplib'


const SERVER_PORT = 4004
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigServer', 'debug')

const start = (app: Application): void => {
  securityMiddleware(app)
  standardMiddleware(app)
  routesMiddleware(app)
  startElasticSearch()
  startQueues()
  usersErrorHandler(app)
  startServer(app)
}

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1)
  app.use(hpp())
  app.use(helmet())
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  )
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      const payload: IAuthPayload = verify(token, config.JWT_TOKEN!) as IAuthPayload
      req.currentUser = payload
    }
    next()
  })
}

const standardMiddleware = (app: Application): void => {
  app.use(compression())
  app.use(json({ limit: '200mb' }))
  app.use(urlencoded({ extended: true, limit: '200mb' }))
}

const routesMiddleware = (app: Application): void => {
  appRoutes(app)
}


const startElasticSearch = (): void => {
  checkConnection()
}

const startQueues  = async (): Promise<void> => {

}

const usersErrorHandler = (app: Application): void => {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    log.log('error', `GigService ${error.comingFrom}:`, error)
    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors())
    }
    next()
  })
}

const startServer = (app: Application): void => {
  try {
    const httpServer: http.Server = new http.Server(app)
    log.info(`Users server has started with process id ${process.pid}`)
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Gig server running on port ${SERVER_PORT}`)
    })
  } catch (error) {
    log.log('error', 'GigService startServer() method error:', error)
  }
}

export { start }