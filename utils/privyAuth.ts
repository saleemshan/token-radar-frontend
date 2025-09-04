import { PrivyClient } from '@privy-io/server-auth'
import { cookies } from 'next/headers'

export const getPrivyUser = async () => {
    const cookieList = cookies()
    const accessToken = cookieList.get('privy-token')

    // console.log(accessToken);

    const privy = new PrivyClient(process.env.NEXT_PUBLIC_PRIVY_APP_ID!, process.env.PRIVY_APP_SECRET!)

    if (!accessToken || !accessToken.value) {
        return null
    }

    try {
        const user = await privy.verifyAuthToken(accessToken.value)
        return { ...user, accessToken: accessToken.value }
    } catch (error) {
        console.error('Error verifying auth token:', error)
    }
}

export const getAccessToken = async () => {
    const cookieList = cookies()
    const accessToken = cookieList.get('privy-token')

    // console.log({ accessToken });

    if (!accessToken || !accessToken.value) {
        return null
    }

    return accessToken.value
}
