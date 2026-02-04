import axios from "axios";
import { AxiosService } from "@gateway/services/axios.service";
import { EnvConfig } from "@gateway/configs";

export let axiosAuthInstance: ReturnType<typeof axios.create>


export class AuthService {
    axiosService: AxiosService;

    constructor(private readonly config: EnvConfig) {
        this.axiosService = new AxiosService(`${this.config.AUTH_BASE_URL}/api/v1/auth`, 'auth')
        axiosAuthInstance = this.axiosService.axios
    }
}
