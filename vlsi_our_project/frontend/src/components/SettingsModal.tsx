import { useEffect, type MouseEvent } from 'react'
import { X, SunMedium, Moon } from 'lucide-react'

export type ThemeOption = 'dark' | 'light'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  theme: ThemeOption
  onThemeChange: (theme: ThemeOption) => void
}

const SettingsModal = ({ isOpen, onClose, theme, onThemeChange }: SettingsModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="bg-slate-800 text-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="text-sm text-gray-400">Personalize your workspace</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
              Theme
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-slate-700 bg-slate-900/40 text-gray-300 hover:border-primary-400 hover:text-white'
                }`}
              >
                <Moon size={20} />
                <div className="text-left">
                  <p className="font-semibold">Dark</p>
                  <p className="text-xs text-gray-400">Perfect for low-light environments</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  theme === 'light'
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-slate-700 bg-slate-900/40 text-gray-300 hover:border-primary-400 hover:text-white'
                }`}
              >
                <SunMedium size={20} />
                <div className="text-left">
                  <p className="font-semibold">Light</p>
                  <p className="text-xs text-gray-400">Bright and vibrant look</p>
                </div>
              </button>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
