'use client'

import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                theme="dark"
                richColors
                closeButton
                toastOptions={{
                    style: {
                        background: '#0d1117',
                        border: '1px solid #30363d',
                        color: '#c9d1d9',
                    },
                    className: 'sonner-toast',
                }}
            />
        </>
    )
}
