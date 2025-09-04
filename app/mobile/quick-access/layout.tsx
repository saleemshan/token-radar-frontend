'use client'

// import { usePrivy } from '@privy-io/react-auth';
// import { redirect } from 'next/navigation';

export default function QuickAccessLayout({ children }: { children: React.ReactNode }) {
    // const { ready, authenticated } = usePrivy();

    // if (!ready || (ready && !authenticated)) {
    //   redirect('/');
    // }

    return <>{children}</>
}
