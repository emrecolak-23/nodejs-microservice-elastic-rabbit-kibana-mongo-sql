import axios from 'axios';
import JWT from 'jsonwebtoken';
import { EnvConfig } from '@gateway/configs';
import { container } from 'tsyringe';

const config = container.resolve(EnvConfig);

export class AxiosService {
  public axios: ReturnType<typeof axios.create>;

  constructor(baseURL: string, serviceName: string) {
    this.axios = this.axiosCreateInstance(baseURL, serviceName);
  }

  public axiosCreateInstance(baseURL: string, serviceName: string): ReturnType<typeof axios.create> {
    let requestGatewayToken = '';
    if (serviceName) {
      requestGatewayToken = JWT.sign({ id: serviceName }, `${config.GATEWAY_JWT_TOKEN}`);
    }

    const instance: ReturnType<typeof axios.create> = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-gateway-token': requestGatewayToken
      },
      withCredentials: true
    });

    instance.interceptors.request.use((config) => {
      console.log('Axios request headers:', config.headers);
      console.log('Gateway token being sent:', config.headers?.['x-gateway-token'] ? 'YES' : 'NO');
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          return Promise.reject(error.response.data || error.response);
        } else if (error.request) {
          return Promise.reject({
            message: 'No response received from server',
            statusCode: 503,
            status: 'error',
            comingFrom: 'GatewayService AxiosService'
          });
        } else {
          return Promise.reject({
            message: error.message || 'Request setup error',
            statusCode: 500,
            status: 'error',
            comingFrom: 'GatewayService AxiosService'
          });
        }
      }
    );

    return instance;
  }
}
