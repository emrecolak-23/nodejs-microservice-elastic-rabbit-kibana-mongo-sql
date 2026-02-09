import { StatusCodes } from 'http-status-codes';
import { GigController } from '@gig/controllers/gig.controller';
import { GigService } from '@gig/services/gig.service';
import { SearchService } from '@gig/services/search.service';
import { gigMockRequest, gigMockResponse, authUserPayload, sellerGig } from './mocks/gig.mock';
import { BadRequestError, NotFoundError, uploads, isDataURL } from '@emrecolak-23/jobber-share';
import { UploadApiResponse } from 'cloudinary';

describe('GigController', () => {
  let gigController: GigController;
  let mockGigService: jest.Mocked<GigService>;
  let mockSearchService: jest.Mocked<SearchService>;

  beforeEach(() => {
    mockGigService = {
      createGig: jest.fn(),
      updateGig: jest.fn(),
      deleteGig: jest.fn(),
      pauseOrUnpauseGig: jest.fn(),
      getGigById: jest.fn(),
      getSellerGigs: jest.fn(),
      getSellerPausedGigs: jest.fn()
    } as unknown as jest.Mocked<GigService>;

    mockSearchService = {
      getGigCount: jest.fn()
    } as unknown as jest.Mocked<SearchService>;

    gigController = new GigController(mockGigService, mockSearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGig method', () => {
    const mockUploadResponse: UploadApiResponse = {
      public_id: 'test-public-id',
      secure_url: 'https://test.com/image.jpg',
      url: 'https://test.com/image.jpg',
      format: 'jpg',
      width: 100,
      height: 100,
      resource_type: 'image',
      created_at: '2024-01-01',
      bytes: 1000,
      etag: 'test-etag',
      version: 1,
      signature: 'test-signature'
    } as UploadApiResponse;

    it('should create a gig successfully', async () => {
      const req = gigMockRequest({}, sellerGig, authUserPayload) as any;
      const res = gigMockResponse();
      req.body.coverImage = 'data:image/png;base64,test';

      (uploads as jest.Mock).mockResolvedValue(mockUploadResponse);
      mockSearchService.getGigCount.mockResolvedValue(10);
      mockGigService.createGig.mockResolvedValue(sellerGig);

      await gigController.createGig(req, res);

      expect(uploads).toHaveBeenCalledWith(req.body.coverImage);
      expect(mockSearchService.getGigCount).toHaveBeenCalled();
      expect(mockGigService.createGig).toHaveBeenCalledWith(
        expect.objectContaining({
          sellerId: sellerGig.sellerId,
          username: authUserPayload.username,
          email: authUserPayload.email,
          coverImage: mockUploadResponse.secure_url,
          sortId: 11
        })
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Gig created successfully',
        gig: sellerGig
      });
    });

    it('should throw BadRequestError when cover image upload fails', async () => {
      const req = gigMockRequest({}, sellerGig, authUserPayload) as any;
      const res = gigMockResponse();
      req.body.coverImage = 'data:image/png;base64,test';

      (uploads as jest.Mock).mockResolvedValue({} as UploadApiResponse);

      await expect(gigController.createGig(req, res)).rejects.toThrow(BadRequestError);
      expect(uploads).toHaveBeenCalledWith(req.body.coverImage);
      expect(mockGigService.createGig).not.toHaveBeenCalled();
    });
  });

  describe('updateGig method', () => {
    const mockUploadResponse: UploadApiResponse = {
      public_id: 'test-public-id',
      secure_url: 'https://test.com/image.jpg',
      url: 'https://test.com/image.jpg',
      format: 'jpg',
      width: 100,
      height: 100,
      resource_type: 'image',
      created_at: '2024-01-01',
      bytes: 1000,
      etag: 'test-etag',
      version: 1,
      signature: 'test-signature'
    } as UploadApiResponse;

    it('should update a gig successfully with new image', async () => {
      const req = gigMockRequest({}, sellerGig, authUserPayload, { gigId: 'test-gig-id' }) as any;
      const res = gigMockResponse();
      req.body.coverImage = 'data:image/png;base64,test';

      (isDataURL as jest.Mock).mockReturnValue(true);
      (uploads as jest.Mock).mockResolvedValue(mockUploadResponse);
      mockGigService.updateGig.mockResolvedValue(sellerGig);

      await gigController.updateGig(req, res);

      expect(isDataURL).toHaveBeenCalledWith(req.body.coverImage);
      expect(uploads).toHaveBeenCalledWith(req.body.coverImage);
      expect(mockGigService.updateGig).toHaveBeenCalledWith('test-gig-id', expect.objectContaining({
        coverImage: mockUploadResponse.secure_url
      }));
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Gig updated successfully',
        gig: sellerGig
      });
    });

    it('should update a gig successfully without new image', async () => {
      const req = gigMockRequest({}, sellerGig, authUserPayload, { gigId: 'test-gig-id' }) as any;
      const res = gigMockResponse();
      req.body.coverImage = 'https://existing-image.com/image.jpg';

      (isDataURL as jest.Mock).mockReturnValue(false);
      mockGigService.updateGig.mockResolvedValue(sellerGig);

      await gigController.updateGig(req, res);

      expect(isDataURL).toHaveBeenCalledWith(req.body.coverImage);
      expect(uploads).not.toHaveBeenCalled();
      expect(mockGigService.updateGig).toHaveBeenCalledWith('test-gig-id', expect.objectContaining({
        coverImage: 'https://existing-image.com/image.jpg'
      }));
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should throw BadRequestError when new image upload fails', async () => {
      const req = gigMockRequest({}, sellerGig, authUserPayload, { gigId: 'test-gig-id' }) as any;
      const res = gigMockResponse();
      req.body.coverImage = 'data:image/png;base64,test';

      (isDataURL as jest.Mock).mockReturnValue(true);
      (uploads as jest.Mock).mockResolvedValue({} as UploadApiResponse);

      await expect(gigController.updateGig(req, res)).rejects.toThrow(BadRequestError);
      expect(mockGigService.updateGig).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when gig is not found', async () => {
      const req = gigMockRequest({}, sellerGig, authUserPayload, { gigId: 'test-gig-id' }) as any;
      const res = gigMockResponse();
      req.body.coverImage = 'https://existing-image.com/image.jpg';

      (isDataURL as jest.Mock).mockReturnValue(false);
      mockGigService.updateGig.mockResolvedValue(null);

      await expect(gigController.updateGig(req, res)).rejects.toThrow(NotFoundError);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('deleteGig method', () => {
    it('should delete a gig successfully', async () => {
      const req = gigMockRequest({}, sellerGig, authUserPayload, { gigId: 'test-gig-id', sellerId: 'test-seller-id' }) as any;
      const res = gigMockResponse();
      mockGigService.deleteGig.mockResolvedValue();

      await gigController.deleteGig(req, res);

      expect(mockGigService.deleteGig).toHaveBeenCalledWith('test-gig-id', 'test-seller-id');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Gig deleted successfully'
      });
    });
  });

  describe('pauseOrUnpauseGig method', () => {
    it('should pause/unpause a gig successfully', async () => {
      const req = gigMockRequest({}, { ...sellerGig, active: false }, authUserPayload, { gigId: 'test-gig-id' }) as any;
      const res = gigMockResponse();
      req.body.active = false;
      mockGigService.pauseOrUnpauseGig.mockResolvedValue();

      await gigController.pauseOrUnpauseGig(req, res);

      expect(mockGigService.pauseOrUnpauseGig).toHaveBeenCalledWith('test-gig-id', false);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Gig paused/unpaused successfully'
      });
    });
  });

  describe('getGigById method', () => {
    it('should get a gig by id successfully', async () => {
      const req = gigMockRequest({}, sellerGig, authUserPayload, { gigId: 'test-gig-id' }) as any;
      const res = gigMockResponse();
      mockGigService.getGigById.mockResolvedValue(sellerGig);

      await gigController.getGigById(req, res);

      expect(mockGigService.getGigById).toHaveBeenCalledWith('test-gig-id');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Gig retrieved successfully',
        gig: sellerGig
      });
    });

    it('should throw NotFoundError when gig is not found', async () => {
      const req = gigMockRequest({}, sellerGig, authUserPayload, { gigId: 'test-gig-id' }) as any;
      const res = gigMockResponse();
      mockGigService.getGigById.mockResolvedValue(null as any);

      await expect(gigController.getGigById(req, res)).rejects.toThrow(NotFoundError);
      expect(mockGigService.getGigById).toHaveBeenCalledWith('test-gig-id');
    });
  });

  describe('getSellerGigs method', () => {
    it('should get seller gigs successfully', async () => {
      const req = gigMockRequest({}, sellerGig, authUserPayload, { sellerId: 'test-seller-id' }) as any;
      const res = gigMockResponse();
      const gigs = [sellerGig];
      mockGigService.getSellerGigs.mockResolvedValue(gigs);

      await gigController.getSellerGigs(req, res);

      expect(mockGigService.getSellerGigs).toHaveBeenCalledWith('test-seller-id');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Seller gigs retrieved successfully',
        gigs
      });
    });

    it('should return empty array when seller has no gigs', async () => {
      const req = gigMockRequest({}, sellerGig, authUserPayload, { sellerId: 'test-seller-id' }) as any;
      const res = gigMockResponse();
      mockGigService.getSellerGigs.mockResolvedValue([]);

      await gigController.getSellerGigs(req, res);

      expect(mockGigService.getSellerGigs).toHaveBeenCalledWith('test-seller-id');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Seller gigs retrieved successfully',
        gigs: []
      });
    });
  });

  describe('getSellerPausedGigs method', () => {
    it('should get seller paused gigs successfully', async () => {
      const req = gigMockRequest({}, sellerGig, authUserPayload, { sellerId: 'test-seller-id' }) as any;
      const res = gigMockResponse();
      const gigs = [sellerGig];
      mockGigService.getSellerPausedGigs.mockResolvedValue(gigs);

      await gigController.getSellerPausedGigs(req, res);

      expect(mockGigService.getSellerPausedGigs).toHaveBeenCalledWith('test-seller-id');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Seller paused gigs retrieved successfully',
        gigs
      });
    });
  });
});
