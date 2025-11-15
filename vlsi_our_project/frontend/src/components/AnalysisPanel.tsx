import { AlertCircle, CheckCircle, Info, Lightbulb, Zap, BookOpen, Loader2 } from 'lucide-react'

interface AnalysisPanelProps {
  analysis: any
  loading: boolean
}

const AnalysisPanel = ({ analysis, loading }: AnalysisPanelProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-500 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Analyzing your code...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <Code2Icon className="mx-auto mb-4 text-gray-600" size={64} />
          <p className="text-lg">Write some Verilog code and click "Analyze" to get started</p>
          <p className="text-sm mt-2">Get real-time error detection, optimization tips, and educational guidance</p>
        </div>
      </div>
    )
  }

  if (!analysis.success) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Analysis Failed</h3>
              <p className="text-gray-300 text-sm">{analysis.error || 'An error occurred during analysis'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Quality Score */}
      {analysis.code_quality_score !== undefined && (
        <div className="bg-gradient-to-r from-primary-900/30 to-purple-900/30 border border-primary-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">Code Quality Score</h3>
              <p className="text-sm text-gray-400">Overall assessment of your code</p>
            </div>
            <div className="text-4xl font-bold text-primary-400">
              {analysis.code_quality_score}
              <span className="text-xl text-gray-500">/100</span>
            </div>
          </div>
          <div className="mt-3 bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-purple-500 h-full transition-all duration-500"
              style={{ width: `${analysis.code_quality_score}%` }}
            />
          </div>
        </div>
      )}

      {/* Syntax Errors */}
      {analysis.syntax_errors && analysis.syntax_errors.length > 0 && (
        <div>
          <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
            <AlertCircle size={20} />
            Syntax Errors ({analysis.syntax_errors.length})
          </h3>
          <div className="space-y-2">
            {analysis.syntax_errors.map((error: any, index: number) => (
              <div key={index} className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                  <div className="flex-1">
                    <p className="text-white font-medium">{error.message}</p>
                    {error.line && (
                      <p className="text-sm text-gray-400 mt-1">Line {error.line}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings && analysis.warnings.length > 0 && (
        <div>
          <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <Info size={20} />
            Warnings ({analysis.warnings.length})
          </h3>
          <div className="space-y-2">
            {analysis.warnings.map((warning: any, index: number) => (
              <div key={index} className="bg-amber-900/20 border border-amber-700 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                  <div className="flex-1">
                    <p className="text-white font-medium">{warning.message}</p>
                    {warning.line && (
                      <p className="text-sm text-gray-400 mt-1">Line {warning.line}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div>
          <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <Lightbulb size={20} />
            AI Suggestions ({analysis.suggestions.length})
          </h3>
          <div className="space-y-3">
            {analysis.suggestions.map((suggestion: any, index: number) => (
              <div key={index} className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">{suggestion.title}</h4>
                <p className="text-gray-300 text-sm mb-3">{suggestion.description}</p>
                {suggestion.educational_context && (
                  <div className="bg-slate-900/50 rounded p-3 border-l-4 border-primary-500">
                    <p className="text-sm text-gray-400 flex items-start gap-2">
                      <BookOpen size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{suggestion.educational_context}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimizations */}
      {analysis.optimizations && analysis.optimizations.length > 0 && (
        <div>
          <h3 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
            <Zap size={20} />
            Optimization Opportunities ({analysis.optimizations.length})
          </h3>
          <div className="space-y-3">
            {analysis.optimizations.map((opt: any, index: number) => (
              <div key={index} className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">{opt.optimization || opt.title}</h4>
                <p className="text-gray-300 text-sm mb-2">{opt.benefit || opt.description}</p>
                {opt.explanation && (
                  <p className="text-gray-400 text-sm italic">{opt.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Educational Notes */}
      {analysis.educational_notes && analysis.educational_notes.length > 0 && (
        <div>
          <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
            <BookOpen size={20} />
            Learning Points
          </h3>
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <ul className="space-y-2">
              {analysis.educational_notes.map((note: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {analysis.explanation && (
        <div>
          <h3 className="font-semibold text-white mb-3">Debugging Assistance</h3>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <p className="text-gray-300 text-sm mb-4">{analysis.explanation}</p>
            
            {analysis.fixes && analysis.fixes.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-primary-400 text-sm">Step-by-Step Fixes:</h4>
                {analysis.fixes.map((fix: any, index: number) => (
                  <div key={index} className="bg-slate-800 rounded p-3">
                    <p className="text-white font-medium mb-1">Step {index + 1}: {fix.step}</p>
                    <p className="text-gray-400 text-sm">{fix.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optimized Code */}
      {analysis.optimized_code && (
        <div>
          <h3 className="font-semibold text-white mb-3">Optimized Code</h3>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{analysis.optimized_code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* No Issues Found */}
      {(!analysis.syntax_errors || analysis.syntax_errors.length === 0) &&
       (!analysis.warnings || analysis.warnings.length === 0) &&
       (!analysis.suggestions || analysis.suggestions.length === 0) &&
       (!analysis.explanation) && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
          <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
          <h3 className="font-semibold text-green-400 mb-2">Great Job!</h3>
          <p className="text-gray-300">No major issues found in your code.</p>
        </div>
      )}
    </div>
  )
}

// Placeholder icon component
const Code2Icon = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
)

export default AnalysisPanel
