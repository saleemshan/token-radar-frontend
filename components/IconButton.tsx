import Link from 'next/link'

interface Props {
    href?: string
    children: React.ReactNode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick?: (event?: any) => void
    className?: string
    style?: React.CSSProperties
    type?: 'button' | 'submit' | 'reset'
    variant?: 'neutral' | 'normal' | 'ghost' | 'danger' | 'primary'
    target?: string
    disabled?: boolean
    uppercase?: boolean
    height?: string
    padding?: string
    size?: 'xs' | 'sm' | 'md' | 'lg'
    id?: string
}

const IconButton = ({
    href,
    children,
    onClick,
    className,
    style,
    type = 'button',
    variant = 'neutral',
    target,
    disabled = false,
    size = 'md',
    id,
}: Props) => {
    let variantStyle = ''
    let sizeStyle = ''

    switch (size) {
        case 'xs':
            sizeStyle = 'w-5 h-5 min-w-5 min-h-5'
            break
        case 'sm':
            sizeStyle = 'w-6 h-6 min-w-6 min-h-6'
            break
        case 'md':
            sizeStyle = 'w-7 h-7 min-w-7 min-h-7'
            break
        case 'lg':
            sizeStyle = 'w-8 h-8 min-w-8 min-h-8'
            break
        default:
            sizeStyle = 'w-6 h-6 min-w-6 min-h-6'
            break
    }

    switch (variant) {
        case 'primary':
            variantStyle = 'bg-primary/20 hover:bg-primary/30 text-primary  border border-primary/20 hover:border-primary/50'
            break
        case 'ghost':
            variantStyle = 'bg-transparent border border-border hover:bg-table-odd text-neutral-text-dark hover:text-neutral-text'
            break
        case 'danger':
            variantStyle = 'bg-negative/10 border border-negative hover:bg-negative/20 text-negative '
            break
        case 'neutral':
        case 'normal':
        default:
            variantStyle = 'bg-table-odd hover:bg-neutral-900 border border-border text-neutral-text '
            break
    }

    if (href) {
        // If the `href` prop is passed, treat it as a link
        return (
            <Link
                id={id}
                href={href}
                target={target}
                onClick={onClick}
                className={`flex items-center justify-center disabled:cursor-not-allowed ${variantStyle} ${className} ${sizeStyle}`}
                style={style}
            >
                {children}
            </Link>
        )
    }

    // If `href` is not passed, treat it as a regular button
    return (
        <button
            id={id}
            type={type}
            className={`flex items-center justify-center ${variantStyle} ${className}`}
            onClick={onClick}
            style={style}
            disabled={disabled}
        >
            {children}
        </button>
    )
}

export default IconButton
