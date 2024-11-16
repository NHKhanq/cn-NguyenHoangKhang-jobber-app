import client, { Channel, Connection } from 'amqplib'
import { config } from "@auth/config"
import { Logger } from 'winston'
import { winstonLogger } from '@tanlan/jobber-shared'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authQueueConnection', 'debug');

async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`)
    const channel: Channel = await connection.createChannel()
    log.info('Auth server connected to queue success')
    closeConnection(channel, connection);
    return channel
  } catch (error) {
    log.log('error', 'AuthService error createConnection() method:', error);
    return undefined
  }
}

function closeConnection(channel: Channel, connection: Connection): void {
  process.once('SIGINT', async () => {
    await channel.close()
    await connection.close()
  });
}

export { createConnection } 