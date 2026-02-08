import { injectable, singleton } from 'tsyringe';
import { Logger } from 'winston';
import { IReviewMessageDetails, winstonLogger } from '@emrecolak-23/jobber-share';
import { EnvConfig } from '@gig/config';
import { QueueConnection } from '@gig/queues/connection';
import { GigService } from '@gig/services/gig.service';
import { Channel, ConsumeMessage, Replies } from 'amqplib';
import { SEED_GIG_QUEUE_CONFIG, UPDATE_GIG_QUEUE_CONFIG } from '@gig/queues/types/consumer.type';

@injectable()
@singleton()
export class GigConsumer {
  private readonly log: Logger = winstonLogger(this.config.ELASTIC_SEARCH_URL, 'gigConsumer', 'debug');
  constructor(
    private readonly queueConnection: QueueConnection,
    private readonly config: EnvConfig,
    private readonly gigService: GigService
  ) {}

  private async ensureChannel(channel: Channel | null): Promise<Channel> {
    if (!channel) {
      channel = (await this.queueConnection.connect()) as Channel;
    }
    return channel;
  }

  private async setupQueue(
    channel: Channel,
    config: { exchangeName: string; routingKey: string; queueName: string }
  ): Promise<Replies.AssertQueue> {
    await channel.assertExchange(config.exchangeName, 'direct', { durable: true });
    const queue: Replies.AssertQueue = await channel.assertQueue(config.queueName, {
      durable: true,
      autoDelete: false
    });
    await channel.bindQueue(queue.queue, config.exchangeName, config.routingKey);

    return queue;
  }

  async consumeGigDirectMessage(channel: Channel) {
    try {
      channel = await this.ensureChannel(channel);

      const gigUpdateQueue = await this.setupQueue(channel, UPDATE_GIG_QUEUE_CONFIG);
      channel.consume(gigUpdateQueue.queue, async (msg: ConsumeMessage | null) => {
        if (!msg) return;
        try {
          const { gigReview } = JSON.parse(msg.content.toString());
          await this.gigService.updateGigReview(JSON.parse(gigReview) as IReviewMessageDetails);
          channel.ack(msg);
        } catch (error) {
          this.log.log('error', 'GigConsumer consumeGigDirectMessage() method error: ', error);
          channel.nack(msg, false, false);
        }
      });
    } catch (error) {
      this.log.log('error', 'GigConsumer consumeGigDirectMessage() method error: ', error);
    }
  }

  async consumeSeedDirectMessage(channel: Channel) {
    try {
      channel = await this.ensureChannel(channel);

      const gigUpdateQueue = await this.setupQueue(channel, SEED_GIG_QUEUE_CONFIG);
      channel.consume(gigUpdateQueue.queue, async (msg: ConsumeMessage | null) => {
        if (!msg) return;
        try {
          // TODO: use seed data function here

          channel.ack(msg);
        } catch (error) {
          this.log.log('error', 'GigConsumer consumeSeedDirectMessage() method error: ', error);
          channel.nack(msg, false, false);
        }
      });
    } catch (error) {
      this.log.log('error', 'GigConsumer consumeSeedDirectMessage() method error: ', error);
    }
  }
}
