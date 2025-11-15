import { useState, useEffect } from 'react'
import { X, Clock, Trash2, Copy, Check } from 'lucide-react'

interface SavedCode {
  id: number
  code: string
  timestamp: string
  name: string
}

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  onLoadCode: (code: string) => void
}

const HistoryModal = ({ isOpen, onClose, onLoadCode }: HistoryModalProps) => {
  const [savedCodes, setSavedCodes] = useState<SavedCode[]>([])
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadHistory()
    }
  }, [isOpen])

  const loadHistory = () => {
    const history = JSON.parse(localStorage.getItem('savedCodes') || '[]')
    setSavedCodes(history.reverse()) // Show newest first
  }

  const handleDelete = (id: number) => {
    const updated = savedCodes.filter(item => item.id !== id)
    localStorage.setItem('savedCodes', JSON.stringify(updated.reverse()))
    setSavedCodes(updated)
  }

  const handleCopy = async (code: string, id: number) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleLoad = (code: string) => {
    onLoadCode(code)
    onClose()
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Clock className="text-primary-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Code History</h2>
              <p className="text-sm text-gray-400">{savedCodes.length} saved items</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Close"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {savedCodes.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto mb-4 text-gray-600" size={48} />
              <p className="text-gray-400">No saved code history yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Click "Save Code" in the sidebar to save your work
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedCodes.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-primary-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.code, item.id)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Copy code"
                      >
                        {copiedId === item.id ? (
                          <Check className="text-green-400" size={18} />
                        ) : (
                          <Copy className="text-gray-400" size={18} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="text-red-400" size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Code Preview */}
                  <div className="bg-slate-950 rounded p-3 mb-3 max-h-32 overflow-y-auto">
                    <pre className="text-xs text-gray-300 font-mono">
                      {item.code.split('\n').slice(0, 5).join('\n')}
                      {item.code.split('\n').length > 5 && '\n...'}
                    </pre>
                  </div>

                  {/* Load Button */}
                  <button
                    type="button"
                    onClick={() => handleLoad(item.code)}
                    className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Load Code
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {savedCodes.length > 0 && (
          <div className="p-4 border-t border-slate-700 bg-slate-900/50">
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to clear all history?')) {
                  localStorage.removeItem('savedCodes')
                  setSavedCodes([])
                }
              }}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryModal
