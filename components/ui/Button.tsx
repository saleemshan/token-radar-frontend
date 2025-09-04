// components/Button.js
import Link from 'next/link'

interface Props {
    href?: string
    children: React.ReactNode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick?: (event?: any) => void
    className?: string
    style?: React.CSSProperties
    type?: 'button' | 'submit' | 'reset'
    variant?: 'neutral' | 'normal' | 'ghost' | 'danger' | 'primary' | 'negative' | 'positive' | 'inactive' | 'active'
    target?: string
    disabled?: boolean
    uppercase?: boolean
    height?: string
    padding?: string
}

const Button = ({
    href,
    children,
    onClick,
    className,
    style,
    type = 'button',
    variant = 'neutral',
    target,
    disabled = false,
    height = 'min-h-8 h-8',
    padding = 'px-3',
    uppercase = true,
}: Props) => {
    const baseStyle = `${
        uppercase ? 'uppercase' : ''
    }  flex items-center text-center  justify-center gap-2   rounded-lg font-semibold focus:outline-none apply-transition tracking-wide ${height} ${className} ${padding}`

    let extraStyles = ''

    switch (variant) {
        case 'primary':
            extraStyles =
                'bg-neutral-300 hover:bg-neutral-300/70 active:bg-neutral-300/50 text-neutral-800  border border-neutral-400 hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed'
            break
        case 'ghost':
            extraStyles =
                'bg-transparent border border-transparent hover:border-border hover:bg-table-odd text-neutral-text focus:border-transparent outline-none focus:outline-none active:outline-none'
            break
        case 'active':
            extraStyles =
                'bg-neutral-800 hover:bg-neutral-900 border border-border text-neutral-text focus:outline-none active:outline-none outline-none '
            break

        case 'inactive':
            extraStyles =
                'bg-transparent border border-border hover:border-border hover:bg-table-odd text-neutral-text-dark hover:text-neutral-text focus:border-border outline-none focus:outline-none active:outline-none'
            break

        case 'danger':
        case 'negative':
            extraStyles = 'bg-negative text-white hover:bg-negative/80 border border-negative '
            break
        case 'positive':
            extraStyles = 'bg-positive text-white hover:bg-positive/80 border border-positive '
            break
        case 'neutral':
        case 'normal':
        default:
            extraStyles =
                'bg-table-odd hover:bg-neutral-900 border border-border text-neutral-text focus:outline-none active:outline-none outline-none '
            break
    }

    if (href) {
        // If the `href` prop is passed, treat it as a link
        return (
            <Link href={href} target={target} onClick={onClick} className={`${baseStyle} ${extraStyles} disabled:cursor-not-allowed`} style={style}>
                {children}
            </Link>
        )
    }

    // If `href` is not passed, treat it as a regular button
    return (
        <button type={type} className={`${baseStyle} ${extraStyles}`} onClick={onClick} style={style} disabled={disabled}>
            {children}
        </button>
    )
}

export default Button
