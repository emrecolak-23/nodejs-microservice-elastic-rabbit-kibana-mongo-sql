import { injectable, singleton } from 'tsyringe';
import { AxiosService } from '@gateway/services/axios.service';
import { EnvConfig } from '@gateway/configs';
import axios, { AxiosResponse } from 'axios';
import { IDeliveredWork, IExtendedDelivery, IOrderDocument, IOrderMessage } from '@emrecolak-23/jobber-share';

export let axiosOrderInstance: ReturnType<typeof axios.create>;

@singleton()
@injectable()
export class OrderService {
  axiosService: AxiosService;

  constructor(private readonly config: EnvConfig) {
    this.axiosService = new AxiosService(`${this.config.ORDER_BASE_URL}/api/v1/order`, 'order');
    axiosOrderInstance = this.axiosService.axios;
  }

  async getOrderById(orderId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.get(`/${orderId}`);
    return response;
  }

  async sellerOrders(sellerId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.get(`/seller/${sellerId}`);
    return response;
  }

  async buyerOrders(buyerId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.get(`/buyer/${buyerId}`);
    return response;
  }

  async createOrderIntent(price: number, buyerId: string, email: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.post('/create-payment-intent', { price, buyerId, email });
    return response;
  }

  async createOrder(body: IOrderDocument): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.post('/', body);
    return response;
  }

  async cancelOrder(paymentIntentId: string, orderId: string, body: IOrderMessage): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put(`/cancel/${orderId}`, { paymentIntentId, orderData: body });
    return response;
  }

  async requestDeliveryDateExtension(orderId: string, body: IExtendedDelivery): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put(`/extension/${orderId}`, body);
    return response;
  }

  async updateDeliveryDate(orderId: string, type: string, body: IExtendedDelivery): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put(`/gig/${type}/${orderId}`, body);
    return response;
  }

  async deliverOrder(orderId: string, body: IDeliveredWork): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put(`/deliver-order/${orderId}`, body);
    return response;
  }

  async approveOrder(orderId: string, body: IOrderMessage): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put(`/approve-order/${orderId}`, body);
    return response;
  }

  async getNotifications(userTo: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.get(`/notification/${userTo}`);
    return response;
  }

  async markNotificationAsRead(notificationId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put('/notification/mark-as-read', { notificationId });
    return response;
  }
}
