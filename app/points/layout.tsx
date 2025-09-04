import { redirect } from 'next/navigation'

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
    if (process.env.NEXT_PUBLIC_ENABLE_REFERRAL !== 'true') {
        redirect('/')
    }

    return <>{children}</>
}
