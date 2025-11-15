import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
}

const CodeEditor = ({ value, onChange }: CodeEditorProps) => {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '')
  }

  return (
    <div className="h-[600px]">
      <Editor
        height="100%"
        defaultLanguage="verilog"
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          bracketPairColorization: {
            enabled: true
          },
          suggest: {
            showKeywords: true,
            showSnippets: true
          }
        }}
      />
    </div>
  )
}

export default CodeEditor
