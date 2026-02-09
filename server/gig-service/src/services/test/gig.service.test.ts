import { GigService } from '@gig/services/gig.service';
import { GigRepository } from '@gig/repositories/gig.repository';
import { ElasticSearch } from '@gig/loaders';
import { SearchRepository } from '@gig/repositories/search.repository';
import { GigProducer } from '@gig/queues/gig.producer';
import { EnvConfig } from '@gig/config';
import { sellerGig } from '@gig/controllers/test/mocks/gig.mock';
import { IReviewMessageDetails, ISellerDocument } from '@emrecolak-23/jobber-share';
import { gigChannel } from '@gig/server';

describe('GigService', () => {
  let gigService: GigService;
  let mockGigRepository: jest.Mocked<GigRepository>;
  let mockElasticSearch: jest.Mocked<ElasticSearch>;
  let mockSearchRepository: jest.Mocked<SearchRepository>;
  let mockGigProducer: jest.Mocked<GigProducer>;
  let mockConfig: jest.Mocked<EnvConfig>;

  beforeEach(() => {
    mockGigRepository = {
      createGig: jest.fn(),
      deleteGig: jest.fn(),
      updateGig: jest.fn(),
      pauseOrUnpauseGig: jest.fn(),
      updateGigReviewProps: jest.fn(),
      toSellerGig: jest.fn()
    } as unknown as jest.Mocked<GigRepository>;

    mockElasticSearch = {
      getIndexedData: jest.fn(),
      addDataToIndex: jest.fn(),
      updateIndexedData: jest.fn(),
      deleteIndexedData: jest.fn()
    } as unknown as jest.Mocked<ElasticSearch>;

    mockSearchRepository = {
      gigsSearchBySellerId: jest.fn()
    } as unknown as jest.Mocked<SearchRepository>;

    mockGigProducer = {
      publishDirectMessage: jest.fn()
    } as unknown as jest.Mocked<GigProducer>;

    mockConfig = {
      ELASTIC_SEARCH_URL: 'http://localhost:9200',
      JWT_TOKEN: 'test-token'
    } as unknown as jest.Mocked<EnvConfig>;

    gigService = new GigService(
      mockConfig,
      mockGigRepository,
      mockElasticSearch,
      mockSearchRepository,
      mockGigProducer
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGigById method', () => {
    it('should get a gig by id from ElasticSearch', async () => {
      mockElasticSearch.getIndexedData.mockResolvedValue(sellerGig);

      const result = await gigService.getGigById('test-gig-id');

      expect(mockElasticSearch.getIndexedData).toHaveBeenCalledWith('gigs', 'test-gig-id');
      expect(result).toEqual(sellerGig);
    });
  });

  describe('getSellerGigs method', () => {
    it('should get seller gigs successfully', async () => {
      const mockHits = [
        { _source: sellerGig },
        { _source: { ...sellerGig, _id: 'another-gig-id' } }
      ];
      mockSearchRepository.gigsSearchBySellerId.mockResolvedValue({
        hits: mockHits,
        total: 2
      } as any);

      const result = await gigService.getSellerGigs('test-seller-id');

      expect(mockSearchRepository.gigsSearchBySellerId).toHaveBeenCalledWith('test-seller-id', true);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(sellerGig);
    });

    it('should return empty array when seller has no gigs', async () => {
      mockSearchRepository.gigsSearchBySellerId.mockResolvedValue({
        hits: [],
        total: 0
      } as any);

      const result = await gigService.getSellerGigs('test-seller-id');

      expect(result).toEqual([]);
    });
  });

  describe('getSellerPausedGigs method', () => {
    it('should get seller paused gigs successfully', async () => {
      const mockHits = [{ _source: sellerGig }];
      mockSearchRepository.gigsSearchBySellerId.mockResolvedValue({
        hits: mockHits,
        total: 1
      } as any);

      const result = await gigService.getSellerPausedGigs('test-seller-id');

      expect(mockSearchRepository.gigsSearchBySellerId).toHaveBeenCalledWith('test-seller-id', false);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(sellerGig);
    });
  });

  describe('createGig method', () => {
    it('should create a gig successfully', async () => {
      const mockCreatedGig = { ...sellerGig, _id: 'new-gig-id' };
      mockGigRepository.createGig.mockResolvedValue(mockCreatedGig as any);
      mockGigRepository.toSellerGig.mockReturnValue(sellerGig);
      mockGigProducer.publishDirectMessage.mockResolvedValue();
      mockElasticSearch.addDataToIndex.mockResolvedValue();

      const result = await gigService.createGig(sellerGig);

      expect(mockGigRepository.createGig).toHaveBeenCalledWith(sellerGig);
      expect(mockGigRepository.toSellerGig).toHaveBeenCalledWith(mockCreatedGig);
      expect(mockGigProducer.publishDirectMessage).toHaveBeenCalledWith(
        gigChannel,
        'jobber-seller-update',
        'user-seller',
        JSON.stringify({
          type: 'update-gig-count',
          gigSellerId: mockCreatedGig.sellerId?.toString(),
          count: 1
        }),
        'Details sent to users service'
      );
      expect(mockElasticSearch.addDataToIndex).toHaveBeenCalledWith('gigs', sellerGig.id, sellerGig);
      expect(result).toEqual(sellerGig);
    });
  });

  describe('deleteGig method', () => {
    it('should delete a gig successfully', async () => {
      mockGigRepository.deleteGig.mockResolvedValue();
      mockGigProducer.publishDirectMessage.mockResolvedValue();
      mockElasticSearch.deleteIndexedData.mockResolvedValue();

      await gigService.deleteGig('test-gig-id', 'test-seller-id');

      expect(mockGigRepository.deleteGig).toHaveBeenCalledWith('test-gig-id');
      expect(mockGigProducer.publishDirectMessage).toHaveBeenCalledWith(
        gigChannel,
        'jobber-seller-update',
        'user-seller',
        JSON.stringify({
          type: 'update-gig-count',
          gigSellerId: 'test-seller-id',
          count: -1
        }),
        'Details sent to users service'
      );
      expect(mockElasticSearch.deleteIndexedData).toHaveBeenCalledWith('gigs', 'test-gig-id');
    });
  });

  describe('updateGig method', () => {
    it('should update a gig successfully', async () => {
      const mockUpdatedGig = { ...sellerGig, title: 'Updated Title' };
      mockGigRepository.updateGig.mockResolvedValue(mockUpdatedGig as any);
      mockGigRepository.toSellerGig.mockReturnValue(sellerGig);
      mockElasticSearch.updateIndexedData.mockResolvedValue();

      const result = await gigService.updateGig('test-gig-id', sellerGig);

      expect(mockGigRepository.updateGig).toHaveBeenCalledWith('test-gig-id', sellerGig);
      expect(mockGigRepository.toSellerGig).toHaveBeenCalledWith(mockUpdatedGig);
      expect(mockElasticSearch.updateIndexedData).toHaveBeenCalledWith('gigs', sellerGig.id, sellerGig);
      expect(result).toEqual(sellerGig);
    });

    it('should return null when gig is not found', async () => {
      mockGigRepository.updateGig.mockResolvedValue(null);

      const result = await gigService.updateGig('test-gig-id', sellerGig);

      expect(mockGigRepository.updateGig).toHaveBeenCalledWith('test-gig-id', sellerGig);
      expect(mockElasticSearch.updateIndexedData).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('pauseOrUnpauseGig method', () => {
    it('should pause a gig successfully', async () => {
      const mockPausedGig = { ...sellerGig, active: false };
      mockGigRepository.pauseOrUnpauseGig.mockResolvedValue(mockPausedGig as any);
      mockGigRepository.toSellerGig.mockReturnValue(sellerGig);
      mockElasticSearch.updateIndexedData.mockResolvedValue();

      await gigService.pauseOrUnpauseGig('test-gig-id', false);

      expect(mockGigRepository.pauseOrUnpauseGig).toHaveBeenCalledWith('test-gig-id', false);
      expect(mockGigRepository.toSellerGig).toHaveBeenCalledWith(mockPausedGig);
      expect(mockElasticSearch.updateIndexedData).toHaveBeenCalledWith('gigs', sellerGig.id, sellerGig);
    });

    it('should unpause a gig successfully', async () => {
      const mockUnpausedGig = { ...sellerGig, active: true };
      mockGigRepository.pauseOrUnpauseGig.mockResolvedValue(mockUnpausedGig as any);
      mockGigRepository.toSellerGig.mockReturnValue(sellerGig);
      mockElasticSearch.updateIndexedData.mockResolvedValue();

      await gigService.pauseOrUnpauseGig('test-gig-id', true);

      expect(mockGigRepository.pauseOrUnpauseGig).toHaveBeenCalledWith('test-gig-id', true);
      expect(mockElasticSearch.updateIndexedData).toHaveBeenCalledWith('gigs', sellerGig.id, sellerGig);
    });

    it('should not update ElasticSearch when gig active status does not match', async () => {
      const mockGig = { ...sellerGig, active: true };
      mockGigRepository.pauseOrUnpauseGig.mockResolvedValue(mockGig as any);

      await gigService.pauseOrUnpauseGig('test-gig-id', false);

      expect(mockGigRepository.pauseOrUnpauseGig).toHaveBeenCalledWith('test-gig-id', false);
      expect(mockElasticSearch.updateIndexedData).not.toHaveBeenCalled();
    });

    it('should not update ElasticSearch when gig is null', async () => {
      mockGigRepository.pauseOrUnpauseGig.mockResolvedValue(null);

      await gigService.pauseOrUnpauseGig('test-gig-id', false);

      expect(mockElasticSearch.updateIndexedData).not.toHaveBeenCalled();
    });
  });

  describe('updateGigReview method', () => {
    it('should update gig review with rating 1', async () => {
      const reviewData: IReviewMessageDetails = {
        gigId: 'test-gig-id',
        rating: 1,
        type: 'review'
      };
      const mockUpdatedGig = { ...sellerGig };
      mockGigRepository.updateGigReviewProps.mockResolvedValue(mockUpdatedGig as any);
      mockGigRepository.toSellerGig.mockReturnValue(sellerGig);
      mockElasticSearch.updateIndexedData.mockResolvedValue();

      await gigService.updateGigReview(reviewData);

      expect(mockGigRepository.updateGigReviewProps).toHaveBeenCalledWith('test-gig-id', 'one', 1);
      expect(mockElasticSearch.updateIndexedData).toHaveBeenCalledWith('gigs', sellerGig.id, sellerGig);
    });

    it('should update gig review with rating 2', async () => {
      const reviewData: IReviewMessageDetails = {
        gigId: 'test-gig-id',
        rating: 2,
        type: 'review'
      };
      const mockUpdatedGig = { ...sellerGig };
      mockGigRepository.updateGigReviewProps.mockResolvedValue(mockUpdatedGig as any);
      mockGigRepository.toSellerGig.mockReturnValue(sellerGig);
      mockElasticSearch.updateIndexedData.mockResolvedValue();

      await gigService.updateGigReview(reviewData);

      expect(mockGigRepository.updateGigReviewProps).toHaveBeenCalledWith('test-gig-id', 'two', 2);
    });

    it('should update gig review with rating 3', async () => {
      const reviewData: IReviewMessageDetails = {
        gigId: 'test-gig-id',
        rating: 3,
        type: 'review'
      };
      const mockUpdatedGig = { ...sellerGig };
      mockGigRepository.updateGigReviewProps.mockResolvedValue(mockUpdatedGig as any);
      mockGigRepository.toSellerGig.mockReturnValue(sellerGig);
      mockElasticSearch.updateIndexedData.mockResolvedValue();

      await gigService.updateGigReview(reviewData);

      expect(mockGigRepository.updateGigReviewProps).toHaveBeenCalledWith('test-gig-id', 'three', 3);
    });

    it('should update gig review with rating 4', async () => {
      const reviewData: IReviewMessageDetails = {
        gigId: 'test-gig-id',
        rating: 4,
        type: 'review'
      };
      const mockUpdatedGig = { ...sellerGig };
      mockGigRepository.updateGigReviewProps.mockResolvedValue(mockUpdatedGig as any);
      mockGigRepository.toSellerGig.mockReturnValue(sellerGig);
      mockElasticSearch.updateIndexedData.mockResolvedValue();

      await gigService.updateGigReview(reviewData);

      expect(mockGigRepository.updateGigReviewProps).toHaveBeenCalledWith('test-gig-id', 'four', 4);
    });

    it('should update gig review with rating 5', async () => {
      const reviewData: IReviewMessageDetails = {
        gigId: 'test-gig-id',
        rating: 5,
        type: 'review'
      };
      const mockUpdatedGig = { ...sellerGig };
      mockGigRepository.updateGigReviewProps.mockResolvedValue(mockUpdatedGig as any);
      mockGigRepository.toSellerGig.mockReturnValue(sellerGig);
      mockElasticSearch.updateIndexedData.mockResolvedValue();

      await gigService.updateGigReview(reviewData);

      expect(mockGigRepository.updateGigReviewProps).toHaveBeenCalledWith('test-gig-id', 'five', 5);
    });

    it('should not update ElasticSearch when gig is null', async () => {
      const reviewData: IReviewMessageDetails = {
        gigId: 'test-gig-id',
        rating: 5,
        type: 'review'
      };
      mockGigRepository.updateGigReviewProps.mockResolvedValue(null);

      await gigService.updateGigReview(reviewData);

      expect(mockElasticSearch.updateIndexedData).not.toHaveBeenCalled();
    });
  });

  describe('seedData method', () => {
    it('should seed gigs successfully', async () => {
      const sellers: ISellerDocument[] = [
        {
          _id: 'seller-1',
          username: 'seller1',
          email: 'seller1@test.com',
          profilePicture: 'https://test.com/pic1.jpg'
        } as ISellerDocument,
        {
          _id: 'seller-2',
          username: 'seller2',
          email: 'seller2@test.com',
          profilePicture: 'https://test.com/pic2.jpg'
        } as ISellerDocument
      ];

      const mockCreatedGig = { ...sellerGig };
      mockGigRepository.createGig.mockResolvedValue(mockCreatedGig as any);
      mockGigRepository.toSellerGig.mockReturnValue(sellerGig);
      mockGigProducer.publishDirectMessage.mockResolvedValue();
      mockElasticSearch.addDataToIndex.mockResolvedValue();

      await gigService.seedData(sellers, '10');

      expect(mockGigRepository.createGig).toHaveBeenCalledTimes(2);
      expect(mockElasticSearch.addDataToIndex).toHaveBeenCalledTimes(2);
    });
  });
});
