import { Activity, AlertCircle, Loader2, DownloadCloud, FileText } from 'lucide-react'
import type { CSSProperties } from 'react'
import './WaveformViewer.css'

export interface NormalizedWaveformData {
  success: boolean
  error?: string
  waveform_data?: any[]
  signals?: {
    name: string
    direction?: string
  }[]
  waveform_url?: string
  simulation_log?: string
}

interface WaveformViewerProps {
  data: NormalizedWaveformData | null
  loading: boolean
}

const WaveformViewer = ({ data, loading }: WaveformViewerProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-500 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Running simulation...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <Activity className="mx-auto mb-4 text-gray-600" size={64} />
          <p className="text-lg">Click "Simulate" to view waveforms</p>
          <p className="text-sm mt-2">Visualize signal behavior over time</p>
        </div>
      </div>
    )
  }

  if (!data.success) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Simulation Failed</h3>
              <p className="text-gray-300 text-sm">{data.error || 'An error occurred during simulation'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const waveform_data = data.waveform_data ?? []
  const signals = data.signals ?? []

  const uniqueSignals = Array.isArray(signals)
    ? Array.from(new Map(signals.map((signal) => [signal.name, signal])).values())
    : []

  const transformedData = waveform_data.map((point: any) => {
    const transformed: Record<string, number | string> = { time: point.time }
    uniqueSignals.forEach((signal) => {
      const rawValue = point[signal.name]
      if (rawValue === '1' || rawValue === 1) {
        transformed[signal.name] = 1
      } else if (rawValue === '0' || rawValue === 0) {
        transformed[signal.name] = 0
      } else {
        const parsed = typeof rawValue === 'string' ? parseInt(rawValue, 2) : Number(rawValue)
        transformed[signal.name] = Number.isFinite(parsed) ? parsed : 0
      }
    })
    return transformed
  })

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="p-6 space-y-6">
      {uniqueSignals.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-white mb-3">Signals</h3>
          <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Signal Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Direction</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Color</th>
                </tr>
              </thead>
              <tbody>
                {uniqueSignals.map((signal, index) => (
                  <tr key={signal.name} className="border-t border-slate-700">
                    <td className="px-4 py-3 text-sm text-gray-300 font-mono">{signal.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{signal.direction ?? 'N/A'}</td>
                    <td className="px-4 py-3">
                      <div
                        className="color-indicator"
                        style={{ '--color': colors[index % colors.length] } as CSSProperties}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.waveform_url && (
            <a
              href={data.waveform_url}
              download
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-300 bg-primary-900/20 border border-primary-700 rounded-md hover:bg-primary-900/30 transition-colors"
            >
              <DownloadCloud size={16} />
              Download VCD
            </a>
          )}
          {data.simulation_log && (
            <details className="bg-slate-900 border border-slate-700 rounded-lg">
              <summary className="cursor-pointer px-4 py-2 text-sm font-semibold text-gray-300 flex items-center gap-2">
                <FileText size={16} />
                Simulation Log
              </summary>
              <pre className="px-4 py-3 text-xs text-gray-300 whitespace-pre-wrap border-t border-slate-700">
                {data.simulation_log}
              </pre>
            </details>
          )}
        </div>
      )}

      {transformedData.length > 0 && uniqueSignals.length > 0 && (
        <div>
          <h3 className="font-semibold text-white mb-3">Digital Waveform View</h3>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 overflow-x-auto">
            <div className="space-y-8 min-w-max">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-40 text-sm font-semibold text-gray-400 flex-shrink-0">Time (ns)</div>
                <div className="flex items-center relative flex-1">
                  {transformedData.map((point, index) => (
                    <div
                      key={index}
                      className="time-marker"
                      style={{ '--left': `${index * 80}px` } as CSSProperties}
                    >
                      {point.time}
                    </div>
                  ))}
                </div>
              </div>

              {uniqueSignals.map((signal, signalIndex) => (
                <div key={signal.name} className="flex items-center gap-4">
                  <div className="w-40 flex items-center gap-2 flex-shrink-0">
                    <div
                      className="color-indicator"
                      style={{ '--color': colors[signalIndex % colors.length] } as CSSProperties}
                    />
                    <span className="text-base font-mono font-semibold text-white">{signal.name}</span>
                    {signal.direction && (
                      <span className="text-sm font-mono text-gray-400 ml-2">{signal.direction}</span>
                    )}
                  </div>

                  <div className="flex items-center h-20 relative flex-1 bg-slate-800 rounded border border-slate-600">
                    {transformedData.map((_point, index) => (
                      <div
                        key={`grid-${signal.name}-${index}`}
                        className="grid-line"
                        style={{ '--left': `${index * 80}px` } as CSSProperties}
                      />
                    ))}

                    <svg
                      className="waveform-svg"
                      style={{ '--min-width': `${transformedData.length * 80}px` } as CSSProperties}
                    >
                      {transformedData.map((point, index) => {
                        const value = point[signal.name]
                        const nextPoint = transformedData[index + 1]
                        const nextValue = nextPoint?.[signal.name]

                        const x1 = index * 80
                        const x2 = (index + 1) * 80
                        const y = value === 1 ? 10 : 60
                        const nextY = nextValue === 1 ? 10 : 60

                        return (
                          <g key={`${signal.name}-${index}`}>
                            <line
                              x1={x1}
                              y1={y}
                              x2={x2}
                              y2={y}
                              stroke={colors[signalIndex % colors.length]}
                              strokeWidth="3"
                            />
                            {nextValue !== undefined && value !== nextValue && (
                              <line
                                x1={x2}
                                y1={y}
                                x2={x2}
                                y2={nextY}
                                stroke={colors[signalIndex % colors.length]}
                                strokeWidth="3"
                              />
                            )}
                            <text
                              x={x1 + 40}
                              y={y - 5}
                              fill="#94a3b8"
                              fontSize="12"
                              textAnchor="middle"
                            >
                              {value as string | number}
                            </text>
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {transformedData.length === 0 && (
        <div className="text-center text-gray-400">
          <p className="text-sm">No waveform samples were returned from the simulator.</p>
        </div>
      )}
    </div>
  )
}

export default WaveformViewer
