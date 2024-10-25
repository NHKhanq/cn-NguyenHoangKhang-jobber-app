import http from 'http'
import 'express-async-errors'
import { Logger } from 'winston'
import { Application } from 'express'
import { config } from '@notification/config'
import { healthRoutes } from '@notification/routes'
import { winstonLogger } from '@tanlan/jobber-shared'
import { consumeAuthEmailMessage, consumeOrderEmailMessage } from '@notification/queues/email.consumer'
import { checkConnection } from '@notification/elasticsearch'
import { createConnection } from '@notification/queues/connection'
import { Channel } from 'amqplib'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug')

const SERVER_PORT = process.env.SERVER_PORT || 4001

export function start(app: Application): void {
    startServer(app)
    
    app.use('', healthRoutes())
    startQueues()
    startElasticSearch()
}

async function startQueues(): Promise<void> {
  const emailChannel: Channel =  await createConnection() as Channel
  await consumeAuthEmailMessage(emailChannel)
  await emailChannel.assertExchange('jobber-email-notification', 'direct')
  await emailChannel.assertExchange('jobber-order-notification', 'direct')
  // const message = JSON.stringify({ name: 'jobber', service: 'notification service' })
  // emailChannel.publish('jobber-email-notification', 'email-auth', Buffer.from(message))
}

function startElasticSearch(): void {
    checkConnection()
}

function startServer(app: Application): void {
    try {
      const httpServer: http.Server = new http.Server(app);
      log.info(`Worker with process id of ${process.pid} on notification server`)
      httpServer.listen(SERVER_PORT, () => {
        log.info(`Notification server running on port ${SERVER_PORT}`)
      });
    } catch (error) {
      log.log('error', 'NotificationService startServer() method:', error)
    }
  }
