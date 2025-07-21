import { Outfit } from 'next/font/google'
import '@/app/globals.css'

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    weight: ['300', '400', '700', '900'],
})

export const metadata = {
    title: 'Admin',
    icons: {
        icon: '/strux.png',
    },
}

export default function AdminLayout({ children }) {
    return (
        <div className={`${outfit.variable} antialiased`}>
            {children}
        </div>
    )
}

