import { injectable, singleton } from 'tsyringe';
import { GigRepository } from '@gig/repositories/gig.repository';
import { IRatingTypes, IReviewMessageDetails, ISellerDocument, ISellerGig, winstonLogger } from '@emrecolak-23/jobber-share';
import { ElasticSearch } from '@gig/loaders';
import { SearchRepository } from '@gig/repositories/search.repository';
import { GigProducer } from '@gig/queues/gig.producer';
import { gigChannel } from '@gig/server';
import { faker } from '@faker-js/faker';
import { Logger } from 'winston';
import { EnvConfig } from '@gig/config';
@injectable()
@singleton()
export class GigService {
  private readonly log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'gigServiceGigService', 'debug');
  constructor(
    private readonly config: EnvConfig,
    private readonly gigRepository: GigRepository,
    private readonly elasticSearch: ElasticSearch,
    private readonly searchRepository: SearchRepository,
    private readonly gigProducer: GigProducer
  ) {}

  async getGigById(gigId: string): Promise<ISellerGig> {
    return await this.elasticSearch.getIndexedData('gigs', gigId);
  }

  async getSellerGigs(sellerId: string): Promise<ISellerGig[]> {
    const resultHits = [];
    const gigs = await this.searchRepository.gigsSearchBySellerId(sellerId, true);

    for (const item of gigs.hits) {
      resultHits.push(item._source as ISellerGig);
    }

    return resultHits;
  }

  async getSellerPausedGigs(sellerId: string): Promise<ISellerGig[]> {
    const resultHits = [];
    const gigs = await this.searchRepository.gigsSearchBySellerId(sellerId, false);

    for (const item of gigs.hits) {
      resultHits.push(item._source as ISellerGig);
    }

    return resultHits;
  }

  async createGig(gigData: ISellerGig): Promise<ISellerGig> {
    const createdGig = await this.gigRepository.createGig(gigData);

    const sellerGig: ISellerGig = this.gigRepository.toSellerGig(createdGig);
    await this.gigProducer.publishDirectMessage(
      gigChannel,
      'jobber-seller-update',
      'user-seller',
      JSON.stringify({ type: 'update-gig-count', gigSellerId: createdGig.sellerId?.toString(), count: 1 }),
      'Details sent to users service'
    );
    await this.elasticSearch.addDataToIndex('gigs', `${sellerGig.id}`, sellerGig);

    return sellerGig;
  }

  async deleteGig(gigId: string, sellerId: string): Promise<void> {
    await this.gigRepository.deleteGig(gigId);
    await this.gigProducer.publishDirectMessage(
      gigChannel,
      'jobber-seller-update',
      'user-seller',
      JSON.stringify({ type: 'update-gig-count', gigSellerId: sellerId, count: -1 }),
      'Details sent to users service'
    );
    await this.elasticSearch.deleteIndexedData('gigs', `${gigId}`);
  }

  async updateGig(gigId: string, gigData: ISellerGig): Promise<ISellerGig | null> {
    const updatedGig = await this.gigRepository.updateGig(gigId, gigData);

    if (updatedGig) {
      const sellerGig: ISellerGig = this.gigRepository.toSellerGig(updatedGig);
      await this.elasticSearch.updateIndexedData('gigs', `${sellerGig.id}`, sellerGig);
      return sellerGig;
    }

    return null;
  }

  async pauseOrUnpauseGig(gigId: string, gigActive: boolean): Promise<void> {
    const pausedOrUnpausedGig = await this.gigRepository.pauseOrUnpauseGig(gigId, gigActive);
    if (pausedOrUnpausedGig && pausedOrUnpausedGig.active === gigActive) {
      const sellerGig: ISellerGig = this.gigRepository.toSellerGig(pausedOrUnpausedGig);
      await this.elasticSearch.updateIndexedData('gigs', `${sellerGig.id}`, sellerGig);
    }
  }

  async updateGigReview(data: IReviewMessageDetails): Promise<void> {
    const ratingTypes: IRatingTypes = {
      '1': 'one',
      '2': 'two',
      '3': 'three',
      '4': 'four',
      '5': 'five'
    };

    const ratingKey: string = ratingTypes[data.rating as keyof typeof ratingTypes];

    const updatedGig = await this.gigRepository.updateGigReviewProps(data.gigId!, ratingKey, data.rating as number);

    if (updatedGig) {
      const sellerGig: ISellerGig = this.gigRepository.toSellerGig(updatedGig);
      await this.elasticSearch.updateIndexedData('gigs', `${sellerGig.id}`, sellerGig);
    }
  }

  async seedData(sellers: ISellerDocument[], count: string): Promise<void> {
    const categories: string[] = [
      'Graphic Design',
      'Digital Marketing',
      'Writing & Translation',
      'Video & Animation',
      'Music & Audio',
      'Programming & Tech',
      'Data',
      'Business'
    ];

    const expectedDelivery: string[] = ['1 Day Delivery', '2 Days Delivery', '3 Days Delivery', '4 Days Delivery', '5 Days Delivery'];

    const randomRatings = [
      { sum: 20, count: 4 },
      { sum: 10, count: 2 },
      { sum: 15, count: 3 },
      { sum: 5, count: 1 }
    ];

    for (let i = 0; i < sellers.length; i++) {
      const sellerDoc: ISellerDocument = sellers[i];
      const title: string = `I will ${faker.word.words(5)}`;
      const basicTitle: string = faker.commerce.productName();
      const basicDescription: string = faker.commerce.productDescription();
      const rating = randomRatings[Math.floor(Math.random() * randomRatings.length)];
      const gig: ISellerGig = {
        profilePicture: sellerDoc.profilePicture!,
        sellerId: sellerDoc._id!,
        email: sellerDoc.email!,
        username: sellerDoc.username!,
        title: title.length <= 80 ? title : title.slice(0, 80),
        basicTitle: basicTitle.length <= 40 ? basicTitle : basicTitle.slice(0, 40),
        basicDescription: basicDescription.length <= 100 ? basicDescription : basicDescription.slice(0, 100),
        categories: categories[Math.floor(Math.random() * categories.length)],
        subCategories: [faker.commerce.department(), faker.commerce.department(), faker.commerce.department()],
        description: faker.lorem.sentences({ min: 2, max: 4 }),
        tags: [faker.commerce.product(), faker.commerce.product(), faker.commerce.product()],
        price: parseInt(faker.commerce.price({ min: 20, max: 30, dec: 0 })),
        coverImage: faker.image.urlPicsumPhotos(),
        expectedDelivery: expectedDelivery[Math.floor(Math.random() * expectedDelivery.length)],
        sortId: parseInt(count, 10) + i + 1,
        ratingsCount: (i + 1) % 4 === 0 ? rating['count'] : 0,
        ratingSum: (i + 1) % 4 === 0 ? rating['sum'] : 0
      };

      this.log.info(`*** Seeding Gig *** - ${i + 1} of ${count}`);

      await this.createGig(gig);
    }
  }
}
