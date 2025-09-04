import React, { useEffect } from 'react'
import IntroJs from 'intro.js'
import 'intro.js/introjs.css'
import { usePrivy } from '@privy-io/react-auth'
import { useSettingsContext } from '@/context/SettingsContext'

interface NewsTradingIntroProps {
    forceShow?: boolean
}

const NewsTradingIntro: React.FC<NewsTradingIntroProps> = ({ forceShow = false }) => {
    const { authenticated } = usePrivy()
    const { handleOpenSettingsModal, handleCloseSettingsModal } = useSettingsContext()

    useEffect(() => {
        // Check if device is mobile

        if (!authenticated) return

        const isMobileDevice = () => {
            return window.innerWidth < 768 // Standard tablet breakpoint
        }

        // Cache selectors for better performance
        const selectors = [
            '#tutorial-sentiment-tag',
            '#tutorial-nrs',
            '#tutorial-momentum',
            '#strategy-button',
            '#mobile-pwa-notifications',
            '#settings-notifications-highlight',
            '#settings-shortcuts-highlight',
        ].filter(selector => selector !== '')

        // Function to check if all target elements are present in the DOM
        const areTargetElementsReady = () => {
            // Use cached selectors for better performance
            return selectors.every(selector => document.querySelector(selector) !== null)
        }

        // Cache modal element for better performance
        let modalElement: HTMLElement | null = null
        let isModalVisible = false // Track modal visibility state

        // Function to hide modal (display: none)
        const hideModal = () => {
            if (isModalVisible) {
                if (!modalElement) {
                    modalElement = document.querySelector('#settings-modal') as HTMLElement
                }
                if (modalElement) {
                    modalElement.style.display = 'none'
                    isModalVisible = false
                }
            }
        }

        // Function to show modal (display: flex)
        const showModal = () => {
            if (!isModalVisible) {
                if (!modalElement) {
                    modalElement = document.querySelector('#settings-modal') as HTMLElement
                }
                if (modalElement) {
                    modalElement.style.display = 'flex'
                    isModalVisible = true
                }
            }
        }

        // Function to start the intro
        const startIntro = () => {
            // Open modal and immediately hide it in one operation
            handleOpenSettingsModal()

            // Use requestAnimationFrame for immediate hide to prevent any blink
            requestAnimationFrame(() => {
                modalElement = document.querySelector('#settings-modal') as HTMLElement
                if (modalElement) {
                    modalElement.style.display = 'none'
                    isModalVisible = false
                }

                // Start intro immediately
                requestAnimationFrame(() => {
                    initializeIntro()
                })
            })
        }

        // Function to initialize intro
        const initializeIntro = () => {
            const intro = IntroJs()

            // Reset modal cache to ensure fresh state
            modalElement = null

            // Save initial scroll positions
            const scrollPositions = new Map()
            const scrollableElements = document.querySelectorAll('.overflow-y-auto, .overflow-auto')

            scrollableElements.forEach((el, index) => {
                scrollPositions.set(`scroll-${index}`, {
                    element: el,
                    top: el.scrollTop,
                    left: el.scrollLeft,
                })
            })

            // Function to restore scroll positions
            const restoreScrollPositions = () => {
                scrollPositions.forEach(pos => {
                    if (pos.element) {
                        pos.element.scrollTop = pos.top
                        pos.element.scrollLeft = pos.left
                    }
                })
            }

            // Configure intro.js with only the specific steps
            const availableSteps = [
                {
                    // Smart Noise Filtering
                    element: '#tutorial-sentiment-tag',
                    title: 'Smart Noise Filtering',
                    intro: 'Crush uses a fine-tuned Hugging Face model to classify each news event by sentiment and impact level, helping you quickly filter for what matters.',
                    position: 'right' as const,
                },
                {
                    // NRS
                    element: '#tutorial-nrs',
                    title: 'NRS (News Reaction Score)',
                    intro: 'A proprietary quant system that analyzes price and on-chain reaction within the first minute of news release to detect truly market-moving events.',
                    position: 'right' as const,
                },
                {
                    // Momentum Indicator
                    element: '#tutorial-momentum',
                    title: 'Momentum Indicator',
                    intro: 'After an event is scored as high-impact, Crush tracks post-news momentum decay using price, volume, and flow signals to help you identify when the market may be running out of steam.',
                    position: 'right' as const,
                },
                {
                    element: '#mobile-pwa-notifications',
                    title: 'Settings',
                    intro: "Click this settings button to configure your notification preferences and keyboard shortcuts. Let me show you what's inside...",
                    position: 'left' as const,
                },
                {
                    element: '#settings-notifications-highlight',
                    title: 'Mobile PWA & Notifications',
                    intro: 'Get instant alerts via push notifications or install our mobile app — never miss a major move again.',
                    position: 'left' as const,
                },
                {
                    element: '#settings-shortcuts-highlight',
                    title: 'Keyboard Shortcuts',
                    intro: 'You can also set custom keyboard shortcuts and arrow keys to rotate between tokens on your news feed to execute trades quickly',
                    position: 'left' as const,
                },
                {
                    // Strategies & Auto-Trading
                    element: '#strategy-button',
                    title: 'Strategies & Auto-Trading',
                    intro: 'Create custom trading strategies that can automatically execute trades based on news triggers — so you never miss a trade, even while you sleep.',
                    position: 'left' as const,
                },
            ]

            // Configure intro.js with the available steps
            intro.setOptions({
                steps: availableSteps,
                tooltipClass: '!bg-black  !min-w-[300px] text-white',
                highlightClass: '!bg-transparent !box-border !border !border-white',
                showProgress: false,
                showBullets: true,
                exitOnOverlayClick: true,
                overlayOpacity: 0.6,
                tooltipPosition: 'auto',
                disableInteraction: false,
                scrollToElement: false, // Prevent auto-scrolling
            })

            // Handle events to prevent scrolling and manage modal visibility
            // FLOW:
            // 1. Steps 1-4: Modal closed, no background blur
            // 2. Step 5-6: Modal opens only for these steps
            // 3. Step 7: Modal closes again
            intro.onbeforechange(targetElement => {
                // Save scroll positions before each step
                scrollableElements.forEach((el, index) => {
                    scrollPositions.set(`scroll-${index}`, {
                        element: el,
                        top: el.scrollTop,
                        left: el.scrollLeft,
                    })
                })

                // Log the current step for debugging
                if (targetElement) {
                    // Moving to step: targetElement.id
                }

                // Check if we're about to show a modal step
                if (
                    targetElement &&
                    (targetElement.id === 'settings-notifications-highlight' || targetElement.id === 'settings-shortcuts-highlight')
                ) {
                    showModal()

                    // Return a promise to ensure modal is shown before intro continues
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(true)
                        }, 10) // Very short delay to ensure modal is visible
                    })
                }

                // Check if we're leaving modal steps (going forward or backward)
                if (
                    targetElement &&
                    (targetElement.id === 'strategy-button' || // Going forward
                        targetElement.id === 'mobile-pwa-notifications') // Going backward
                ) {
                    // Hide modal when leaving modal steps
                    hideModal()

                    // Return a promise to ensure modal is hidden before intro continues
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(true)
                        }, 10) // Very short delay to ensure modal is hidden
                    })
                }

                // Always return true to allow smooth transition
                return true
            })

            intro.onchange(targetElement => {
                // Handle step changes smoothly
                if (targetElement) {
                    // Step changed to: targetElement.id
                }
            })

            intro.onafterchange(() => {
                // Restore scroll positions after each step
                setTimeout(restoreScrollPositions, 10)
            })

            const finishIntro = () => {
                handleCloseSettingsModal()
                localStorage.setItem('crush_intro_news_trading_page', 'true')
                // custom event instead of "storage"
                window.dispatchEvent(new Event('crush-intro'))
            }

            intro.onexit(finishIntro)

            intro.oncomplete(finishIntro)

            // Start the intro and then immediately restore scroll positions
            intro.start()

            // Restore scrolling after a brief delay
            setTimeout(restoreScrollPositions, 50)
        }

        // Attempt to start intro with polling mechanism to ensure DOM elements are loaded
        const attemptToStartIntro = () => {
            // Skip tutorial on mobile devices
            if (isMobileDevice()) {
                window.dispatchEvent(new Event('crush-intro'))
                return
            }

            const accepted = localStorage.getItem('newsTradingAgreementAccepted')

            if (!accepted || accepted !== 'true') {
                return
            }

            // Additional check: prevent tutorial if referral check is in progress
            const referralModalOpen = localStorage.getItem('crush_intro_news_trading_page') === 'true'
            if (referralModalOpen) {
                return
            }

            if (forceShow || !JSON.parse(localStorage.getItem('crush_intro_news_trading_page') ?? 'false')) {
                let checkCount = 0
                const maxChecks = 20 // Maximum 20 attempts

                const checkAndStart = () => {
                    checkCount++
                    handleOpenSettingsModal()

                    if (areTargetElementsReady()) {
                        startIntro()
                        return true
                    } else if (checkCount >= maxChecks) {
                        return true
                    }

                    return false
                }

                // Try immediately with requestAnimationFrame for better performance
                const tryStart = () => {
                    if (!checkAndStart()) {
                        // If not successful, set up faster polling
                        const intervalId = setInterval(() => {
                            if (checkAndStart()) {
                                clearInterval(intervalId)
                            }
                        }, 50) // Further reduced from 100ms to 50ms

                        // Clean up interval if component unmounts
                        return () => {
                            clearInterval(intervalId)
                        }
                    }
                }

                // Use requestAnimationFrame for immediate check
                requestAnimationFrame(tryStart)
            }
        }

        const handleIntro = () => {
            const hasSeen = JSON.parse(localStorage.getItem('crush_intro_news_trading_page') ?? 'false')
            if (hasSeen) {
                return
            }
            attemptToStartIntro()
        }

        const handleReferralModalOpen = () => {
            // Tutorial should not start when referral modal is open
            return
        }

        const handleReferralCompleted = () => {
            // Tutorial can now start after referral is completed
            attemptToStartIntro()
        }

        window.addEventListener('crush-intro', handleIntro)
        window.addEventListener('referral-modal-open', handleReferralModalOpen)
        window.addEventListener('referral-completed', handleReferralCompleted)

        // Wait for initial render then try to start the intro
        // Increased delay to allow referral system to complete its check
        const timer = setTimeout(() => {
            attemptToStartIntro()
        }, 3000)

        // Cleanup timers
        return () => {
            clearTimeout(timer)

            window.removeEventListener('crush-intro', handleIntro)
            window.removeEventListener('referral-modal-open', handleReferralModalOpen)
            window.removeEventListener('referral-completed', handleReferralCompleted)
        }
    }, [forceShow, authenticated])

    return null
}

export default NewsTradingIntro
