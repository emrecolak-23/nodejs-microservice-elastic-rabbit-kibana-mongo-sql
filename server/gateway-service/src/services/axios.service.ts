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
        gatewayToken: requestGatewayToken
      },
      withCredentials: true
    });

    return instance;
  }
}
