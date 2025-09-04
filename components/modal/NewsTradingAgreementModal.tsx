'use client'
import React, { useEffect, useState } from 'react'
import Portal from '@/portal/ModalPortal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '../ui/Button'
import useHaptic from '@/hooks/useHaptic'

const NewsTradingAgreementModal = () => {
    const router = useRouter()
    const { triggerHaptic } = useHaptic()
    const [showAgreement, setShowAgreement] = useState(false)

    const handleAgree = () => {
        triggerHaptic(50)
        localStorage.setItem('newsTradingAgreementAccepted', 'true')
        window.dispatchEvent(new Event('crush-intro'))
        setShowAgreement(false)
    }

    const handleDisagree = () => {
        localStorage.removeItem('newsTradingAgreementAccepted')
        window.dispatchEvent(new Event('crush-intro'))
        setShowAgreement(false)
        if (window.history.length > 1) {
            router.back()
        } else {
            router.replace('/')
        }
    }

    useEffect(() => {
        const accepted = localStorage.getItem('newsTradingAgreementAccepted')

        if (!accepted || accepted !== 'true') {
            setShowAgreement(true)
        }
    }, [])

    if (showAgreement)
        return (
            <Portal targetId="modal-portal">
                <div className={` fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-3 z-[5000] `}>
                    <div className="max-w-xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full ">
                        <div className="p-3 flex border-b border-border items-center bg-black">
                            <div className=" text-base font-semibold leading-6 text-white flex-1 ">Crush News Trading</div>
                        </div>

                        <div className="  max-h-[50vh] overflow-y-auto flex flex-col w-full  p-3 gap-2">
                            <p>
                                {`Crush News Trading is your `}
                                <b>AI-powered radar for high-impact market events</b>
                                {`. Crush doesn’t just show you headlines — it predicts which ones are likely to move prices and enable rapid-fire 1-click trade execution powered by the Hyperliquid Perps DEX.`}
                            </p>
                            <p>
                                By continuing, you confirm that you understand the risks involved, will not rely on Crush for financial advice, and
                                accept that we are not responsible for any financial losses incurred.
                            </p>
                            <p>
                                {`Click "I agree" to confirm you’ve read and accepted our `}
                                <Link target="_blank" href="/terms-of-service" className="underline">
                                    Terms of Service.
                                </Link>
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-3 border-t border-border">
                            <Button onClick={handleDisagree} variant="ghost" className="text-xs">
                                Disagree
                            </Button>
                            <Button onClick={handleAgree} variant="primary" className="text-xs">
                                I Agree
                            </Button>
                        </div>
                    </div>
                </div>
            </Portal>
        )
}

NewsTradingAgreementModal.displayName = 'NewsTradingAgreementModal'

export default NewsTradingAgreementModal
