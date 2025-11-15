import { useState, useEffect } from 'react'
import { FileCode, ChevronDown } from 'lucide-react'
import axios from 'axios'

interface Template {
  name: string
  description: string
  code: string
  testbench?: string
}

interface TemplateSummary {
  key: string
  name: string
  description: string
  code: string
  testbench?: string
}

interface TemplateSelectorProps {
  onSelect: (template: TemplateSummary) => void
}

const TemplateSelector = ({ onSelect }: TemplateSelectorProps) => {
  const [templates, setTemplates] = useState<Record<string, Template>>({})
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/templates')
      if (response.data.success) {
        setTemplates(response.data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      // Fallback templates
      setTemplates({
        full_adder: {
          name: 'Full Adder',
          description: 'Basic combinational circuit',
          code: `module full_adder(
    input a, b, cin,
    output sum, cout
);
    assign sum = a ^ b ^ cin;
    assign cout = (a & b) | (b & cin) | (a & cin);
endmodule`
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (key: string, template: Template) => {
    onSelect({
      key,
      name: template.name,
      description: template.description,
      code: template.code,
      testbench: template.testbench
    })
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
      >
        <FileCode size={18} />
        Templates
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-20 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Loading templates...</div>
            ) : (
              <div className="p-2">
                {Object.entries(templates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => handleTemplateSelect(key, template)}
                    className="w-full text-left p-3 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <div className="font-semibold text-white">{template.name}</div>
                    <div className="text-sm text-gray-400 mt-1">{template.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default TemplateSelector
