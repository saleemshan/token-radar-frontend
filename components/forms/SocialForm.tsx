import React, { useState } from 'react'

import Button from '../ui/Button'

// import { toast } from 'react-toastify'
import { usePrivy } from '@privy-io/react-auth'
import { toast } from 'react-toastify'
import Spinner from '../Spinner'
import useHaptic from '@/hooks/useHaptic'

interface SocialFormProps {
    handleToggleModal: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SocialForm = ({ handleToggleModal }: SocialFormProps) => {
    const { user, linkTelegram, unlinkTelegram, ready, authenticated } = usePrivy()
    const { triggerHaptic } = useHaptic()

    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        triggerHaptic(50)

        try {
            setIsLoading(true)
            if (user?.telegram && user.telegram.telegramUserId) {
                await unlinkTelegram(user.telegram.telegramUserId)
                toast.success('Telegram account successfully unlinked.')
            } else {
                await linkTelegram()
                toast.success('Telegram account successfully linked.')
            }
        } catch (error) {
            toast.error('Something went wrong, try again.')
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    if (ready && authenticated && process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LINK === 'true')
        return (
            <div className="flex flex-col w-full gap-3 flex-1">
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between gap-1">
                        <label htmlFor="timezone" className="text-sm text-neutral-text">
                            Telegram {user?.telegram?.username ? `${user?.telegram?.username}` : ''}
                        </label>

                        <Button onClick={handleSubmit} variant="primary" disabled={isLoading}>
                            <span>{user?.telegram ? 'Unlink' : 'Link'} </span>

                            {isLoading && <Spinner variant="primary" className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        )
}

export default SocialForm
