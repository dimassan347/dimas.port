import { X } from 'lucide-react'

const TOAST_STYLES = {
    success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100',
    error: 'border-red-500/25 bg-red-500/10 text-red-100',
    info: 'border-blue-500/25 bg-blue-500/10 text-blue-100',
}

export default function ToastStack({ toasts = [], onDismiss }) {
    if (!toasts.length) return null

    return (
        <div className="fixed top-4 right-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${TOAST_STYLES[toast.type] || TOAST_STYLES.info}`}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="text-sm leading-relaxed">{toast.message}</div>
                        <button
                            type="button"
                            onClick={() => onDismiss?.(toast.id)}
                            className="mt-0.5 text-current/70 hover:text-current transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}