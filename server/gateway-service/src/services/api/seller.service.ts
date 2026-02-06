import { ISellerDocument } from '@emrecolak-23/jobber-share';
import { AxiosService } from '../axios.service';
import { EnvConfig } from '@gateway/configs';
import axios, { AxiosResponse } from 'axios';
import { injectable, singleton } from 'tsyringe';

export let axiosSellerInstance: ReturnType<typeof axios.create>;

@singleton()
@injectable()
export class SellerService {
  axiosService: AxiosService;
  constructor(private readonly config: EnvConfig) {
    this.axiosService = new AxiosService(`${this.config.USERS_BASE_URL}/api/v1/seller`, 'seller');
    axiosSellerInstance = this.axiosService.axios;
  }

  async getSellerById(sellerId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosSellerInstance.get(`/id/${sellerId}`);
    return response;
  }

  async getSellerByUsername(username: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosSellerInstance.get(`/username/${username}`);
    return response;
  }

  async getRandomSellers(count: number): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosSellerInstance.get(`/random/${count}`);
    return response;
  }

  async createSeller(body: ISellerDocument): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosSellerInstance.post('/create', body);
    return response;
  }

  async updateSeller(sellerId: string, body: ISellerDocument): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosSellerInstance.post(`/${sellerId}`, body);
    return response;
  }

  async seed(count: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosSellerInstance.put(`/seed/${count}`);
    return response;
  }
}
