'use client'
import React, { useEffect } from 'react'
import Intercom from '@intercom/messenger-js-sdk'
import { usePrivy } from '@privy-io/react-auth'
import axios from 'axios'

const IntercomMessenger = () => {
    const { authenticated, ready, user } = usePrivy()

    useEffect(() => {
        const initIntercom = async () => {
            if (!authenticated || !ready || !user) return
            if (!process.env.NEXT_PUBLIC_INTERCOM_APP_ID) return

            const response = await axios.get('/api/user/intercom')
            if (response.data) {
                console.log(response.data)

                Intercom({
                    app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
                    user_id: user.id,
                    email: user.email ? String(user.email) : undefined,
                    created_at: Math.floor(user.createdAt.getTime() / 1000),
                    user_hash: response.data,
                })
            }
        }

        initIntercom()
    }, [authenticated, ready, user])

    return <></>
}

export default IntercomMessenger
