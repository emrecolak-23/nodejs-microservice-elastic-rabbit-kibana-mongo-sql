import axios, { AxiosResponse } from 'axios';
import { AxiosService } from '@gateway/services/axios.service';
import { EnvConfig } from '@gateway/configs';
import { injectable, singleton } from 'tsyringe';

export let axiosBuyerInstance: ReturnType<typeof axios.create>;

@singleton()
@injectable()
export class BuyerService {
  axiosService: AxiosService;

  constructor(private readonly config: EnvConfig) {
    this.axiosService = new AxiosService(`${this.config.USERS_BASE_URL}/api/v1/buyer`, 'buyer');
    axiosBuyerInstance = this.axiosService.axios;
  }

  async getCurrentBuyerByUsername(): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosBuyerInstance.get('/username');
    return response;
  }

  async getBuyerByUsername(username: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosBuyerInstance.get(`/${username}`);
    return response;
  }

  async getBuyerByEmail(): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosBuyerInstance.get(`/email`);
    return response;
  }
}
