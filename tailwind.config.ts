import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './context/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './public/static/*.css',
    ],
    theme: {
        extend: {
            fontSize: {
                '2xs': '10px',
            },
            colors: {
                primary: '#FF1850',
                'neutral-text': '#dddddd',
                'neutral-text-dark': '#656565',
                'neutral-icon': '#4A4A4A',
                'background-neutral': '#151515',
                border: '#191919', //2f2f2f
                positive: '#80FF6C',
                negative: '#FF1850',
                'table-odd': '#101010',
                'table-even': '#000000',
            },

            fontFamily: {
                montserrat: ['var(--font-montserrat)'],
                'open-sans': ['var(--font-open-sans)'],
            },
            typography: {
                DEFAULT: {
                    css: {
                        p: {
                            margin: 0,
                        },
                        hr: {
                            'margin-top': '1.5em',
                            'margin-bottom': '1.5em',
                        },
                        ul: {
                            'margin-top': '0.5em',
                        },
                    },
                },
            },
            keyframes: {
                wave: {
                    '0%': { transform: 'translateX(-100%)' },
                    '50%, 100%': { transform: 'translateX(100%)' },
                },
                'pulse-glow': {
                    '0%': { boxShadow: '0 0 4px red' },
                    '50%': { boxShadow: '0 0 14px red' },
                    '100%': { boxShadow: '0 0 4px red' },
                },
                'flicker-flash': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.2' },
                },
            },
            animation: {
                wave: 'wave 2s infinite',
                'pulse-glow': 'pulse-glow 1.2s ease-in-out infinite',
                'flicker-flash': 'flicker-flash 0.4s ease-in-out 2',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        // ...
    ],
}
export default config
