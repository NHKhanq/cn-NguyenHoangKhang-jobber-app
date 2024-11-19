import axios, { AxiosResponse } from "axios";
import { AxiosService } from "../axios";
import { config } from "@gateway/config";
import { IAuth } from "@tanlan/jobber-shared";

export let axiosAuthInstance: ReturnType<typeof axios.create>

class AuthtService {
    axiosService: AxiosService

    constructor() {
        this.axiosService = new AxiosService(`$${config.AUTH_BASE_URL}/api/v1/auth`, 'auth')
        axiosAuthInstance = this.axiosService.axios
    }

    async getCurrentUser(): Promise<AxiosResponse> {
        const response: AxiosResponse  = await axiosAuthInstance.get('/currentuser')
        return response
    }

    async getRefreshToken(username: string): Promise<AxiosResponse> {
        const response: AxiosResponse  = await axiosAuthInstance.get(`/refresh-token/${username}`)
        return response
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<AxiosResponse> {
        const response: AxiosResponse  = await axiosAuthInstance.put('/change-password', {currentPassword, newPassword})
        return response
    }

    async signUp(body: IAuth): Promise<AxiosResponse> {
        const response: AxiosResponse  = await this.axiosService.axios.post('/signup', body)
        return response
    }

    async signIn(body: IAuth): Promise<AxiosResponse> {
        const response: AxiosResponse  = await this.axiosService.axios.post('/signin', body)
        return response
    }

    async resendemail(data: { userId: number, email: string }): Promise<AxiosResponse> {
        const response: AxiosResponse  = await this.axiosService.axios.post('/resend-email', data)
        return response
    }

    async forgotPassword(email: string): Promise<AxiosResponse> {
        const response: AxiosResponse  = await this.axiosService.axios.put('/forgot-password', { email })
        return response
    }

    async resetPassword(token: string, password: string, confirmPassword: string): Promise<AxiosResponse> {
        const response: AxiosResponse  = await this.axiosService.axios.put(`/reset-password/${token}`, { password, confirmPassword })
        return response
    }

    async getGigs(query: string, from: string, size: string, type: string): Promise<AxiosResponse> {
        const response: AxiosResponse  = await this.axiosService.axios.put(`/search/gig/${from}${size}/${from}/${type}?/${query}`)
        return response
    }

    async getGig(gigId: string): Promise<AxiosResponse> {
        const response: AxiosResponse  = await this.axiosService.axios.put(`/search/gig/${gigId}`)
        return response
    }

    async seed(count: string): Promise<AxiosResponse> {
        const response: AxiosResponse  = await this.axiosService.axios.put(`/seed/${count}`)
        return response
    }
}


export const authService: AuthtService = new AuthtService()