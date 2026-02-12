import { AxiosService } from '@gateway/services/axios.service';
import { EnvConfig } from '@gateway/configs';
import { injectable, singleton } from 'tsyringe';
import axios, { AxiosResponse } from 'axios';
import { IReviewDocument } from '@emrecolak-23/jobber-share';

export let axiosReviewInstance: ReturnType<typeof axios.create>;
@singleton()
@injectable()
export class ReviewService {
  private axiosService: AxiosService;

  constructor(private readonly config: EnvConfig) {
    this.axiosService = new AxiosService(`${this.config.REVIEW_BASE_URL}/api/v1/review`, 'review');
    axiosReviewInstance = this.axiosService.axios;
  }

  async getReviewsByGigId(gigId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosReviewInstance.get(`/gig/${gigId}`);
    return response;
  }

  async getReviewsBySellerId(sellerId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosReviewInstance.get(`/seller/${sellerId}`);
    return response;
  }

  async addReview(body: IReviewDocument): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosReviewInstance.post('/', body);
    return response;
  }
}
