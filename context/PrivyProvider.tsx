'use client'

import { PrivyProvider } from '@privy-io/react-auth'

export default function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}
            config={{
                // Customize Privy's appearance in your app
                appearance: {
                    theme: '#000000',
                    accentColor: '#ff1850',
                    logo: 'https://res.cloudinary.com/crush-xyz/image/upload/v1727059238/crush-logo-wordmark-privy-2.png',
                    walletList: ['metamask', 'phantom', 'rabby_wallet'],
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    createOnLogin: 'users-without-wallets',
                },
                loginMethods: ['email'],
            }}
        >
            {children}
        </PrivyProvider>
    )
}
