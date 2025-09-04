// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customTheme = (theme: any) => ({
    ...theme,
    colors: {
        ...theme.colors,

        danger: '#FF1850',
        dangerLight: '#52091a',

        primary: '#191919', // Custom primary color
        primary25: '#191919', // Focused option background (background-neutral)
        primary50: '#101010',
        primary75: '#101010',

        neutral0: '#101010', // Background color (table-odd)
        neutral5: '#101010', // Dropdown background (table-odd)
        neutral10: '#262626', // Text color for selected value and placeholder (neutral-text)
        neutral20: '#191919', // Border color (border)
        neutral30: '#191919', // Text color for options (neutral-text-dark)dddddd
        neutral40: '#dddddd', // Text color for options (neutral-text-dark)dddddd
        neutral50: '#4A4A4A', // Icon color (neutral-icon)
        neutral60: '#656565', // Positive color (not directly used but for reference)
        neutral70: '#656565', // Negative color (not directly used but for reference)

        neutral80: '#dddddd',
        neutral90: '#dddddd',
    },
    spacing: {
        ...theme.spacing,
        controlHeight: 40, // Set height like h-10
        baseUnit: 2, // Set padding like px-2
    },
    borderRadius: 8, // Rounded corners (rounded-lg)
    fontSize: '0.875rem', // Text size (text-sm)
})
