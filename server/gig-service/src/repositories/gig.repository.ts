import { Model } from 'mongoose';
import { inject, injectable, singleton } from 'tsyringe';
import { IGigDocument } from '../models/gig.schema';

@injectable()
@singleton()
export class GigRepository {
  constructor(@inject('GigModel') private readonly gigModel: Model<IGigDocument>) {}
}
