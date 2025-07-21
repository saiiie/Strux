import { Outfit } from 'next/font/google'
import '@/app/globals.css'

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    weight: ['300', '400', '700', '900'],
})

export const metadata = {
    title: 'Project Manager',
    icons: {
        icon: '/strux.png',
    },
}

export default function PMLayout({ children }) {
    return (
        <div className={`${outfit.variable} antialiased`}>
            {children}
        </div>
    )
}

