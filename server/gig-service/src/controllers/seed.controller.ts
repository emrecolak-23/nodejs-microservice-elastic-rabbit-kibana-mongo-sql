import { Request, Response } from 'express';
import { injectable, singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { GigProducer } from '@gig/queues/gig.producer';

@injectable()
@singleton()
export class SeedController {
  constructor(private readonly gigProducer: GigProducer) {}

  async createSeeds(req: Request, res: Response): Promise<void> {
    const { count } = req.params;

    await this.gigProducer.publishDirectMessage({
      exchangeName: 'jobber-gig',
      routingKey: 'get-sellers',
      message: JSON.stringify({ type: 'getSellers', count }),
      logMessage: 'Gig seed message sent to user service.'
    });

    res.status(StatusCodes.CREATED).json({
      message: 'Gig created successfully'
    });
  }
}
