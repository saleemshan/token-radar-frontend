// lib/axios.ts
import axios from 'axios'
import { getAccessToken, useLogout } from '@privy-io/react-auth'

const axiosLib = axios.create({
    withCredentials: true,
})

axiosLib.interceptors.request.use(async config => {
    const token = await getAccessToken()

    // console.log('AXIOS LIB:', { token })

    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

axiosLib.interceptors.response.use(
    res => res,
    async err => {
        const originalRequest = err.config

        if (err.response?.status === 401 && !originalRequest._retry) {
            console.log('401 unathorized, refreshing token')
            originalRequest._retry = true
            try {
                const newToken = await getAccessToken()
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return axiosLib(originalRequest)
            } catch (refreshError) {
                console.log('Fail to refresh token, logout')
                const { logout: handleSignOut } = useLogout()
                await handleSignOut() // logout if failed to refresh token
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(err)
    }
)

export default axiosLib
