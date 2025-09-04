// hooks/useUserAgent.ts
import { useEffect, useState } from 'react'

type Browser = 'Google Chrome' | 'Mozilla Firefox' | 'Safari' | 'Microsoft Edge' | 'Opera' | 'Internet Explorer' | 'Unknown'

type OS = 'Windows 10' | 'Windows 8.1' | 'Windows 8' | 'Windows 7' | 'macOS' | 'Android' | 'iOS' | 'Linux' | 'Unknown'

type UserAgentInfo = {
    browser: Browser
    os: OS
    isDesktop: boolean
    isSafari: boolean
}

export const useUserAgent = (): UserAgentInfo => {
    const [info, setInfo] = useState<UserAgentInfo>({ browser: 'Unknown', os: 'Unknown', isDesktop: false, isSafari: false })

    useEffect(() => {
        if (typeof navigator === 'undefined') return

        const userAgent = navigator.userAgent

        const getBrowser = (): Browser => {
            if (/Edg\//.test(userAgent)) return 'Microsoft Edge'
            if (/OPR\//.test(userAgent)) return 'Opera'
            if (/Chrome\//.test(userAgent)) return 'Google Chrome'
            if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return 'Safari'
            if (/Firefox\//.test(userAgent)) return 'Mozilla Firefox'
            if (/MSIE|Trident\//.test(userAgent)) return 'Internet Explorer'
            return 'Unknown'
        }

        const getOS = (): OS => {
            if (/Windows NT 10/.test(userAgent)) return 'Windows 10'
            if (/Windows NT 6.3/.test(userAgent)) return 'Windows 8.1'
            if (/Windows NT 6.2/.test(userAgent)) return 'Windows 8'
            if (/Windows NT 6.1/.test(userAgent)) return 'Windows 7'
            if (/Mac OS X 10[._]\d+/.test(userAgent)) return 'macOS'
            if (/Android/.test(userAgent)) return 'Android'
            if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS'
            if (/Linux/.test(userAgent)) return 'Linux'
            return 'Unknown'
        }

        setInfo({
            browser: getBrowser(),
            os: getOS(),
            isDesktop: !/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent),
            isSafari: /^((?!Chrome|Chromium|Edg|OPR).)*Safari/.test(userAgent),
        })
    }, [])

    return info
}
