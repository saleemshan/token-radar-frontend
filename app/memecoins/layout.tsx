import { redirect } from 'next/navigation'

export default function MemecoinsLayout({ children }: { children: React.ReactNode }) {
    if (process.env.NEXT_PUBLIC_ENABLE_MEMECOINS !== 'true') {
        redirect('/')
    }

    return <>{children}</>
}
