import { Channel, ConsumeMessage, Replies } from 'amqplib';
import { injectable, singleton } from 'tsyringe';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@users/config';
import { QueueConnection } from '@users/queues/connection';
import { IBuyerAttributes, IBuyerDocument } from '@users/models/buyer.schema';
import { BuyerRepository } from '@users/repositories';

@injectable()
@singleton()
export class UserConsumer {
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'usersServiceConsumer', 'debug');

  constructor(
    private readonly config: EnvConfig,
    private readonly queueConnection: QueueConnection,
    private readonly buyerRepository: BuyerRepository
  ) {}

  async consumeBuyerDirectMessage(channel: Channel): Promise<void> {
    try {
      if (!channel) {
        channel = (await this.queueConnection.connect()) as Channel;
      }

      const exhangeName = 'jobber-buyer-update';
      const routingKey = 'user-buyer';
      const queueName = 'user-buyer-queue';

      await channel.assertExchange(exhangeName, 'direct', { durable: true });
      const jobberQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
      await channel.bindQueue(jobberQueue.queue, exhangeName, routingKey);
      channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
        const { type } = JSON.parse(msg!.content.toString() || '{}');

        if (type === 'auth') {
          const { username, email, profilePicture, country, createdAt } = JSON.parse(msg!.content.toString() || '{}');
          const buyer: IBuyerAttributes = {
            username,
            email,
            profilePicture,
            country,
            purchasedGigs: []
          };

          await this.buyerRepository.createBuyer(buyer);
        } else {
          const { buyerId, purchasedGigs } = JSON.parse(msg!.content.toString() || '{}');
          await this.buyerRepository.updateBuyerPurchasedGigsProp(buyerId!, purchasedGigs!, type);
        }
      });
    } catch (error) {
      this.log.log('error', 'UserConsumer consumeBuyerDirerctMessage() method error: ', error);
    }
  }
}
