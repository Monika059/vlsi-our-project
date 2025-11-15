import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import HistoryModal from '../components/HistoryModal'
import SettingsModal, { type ThemeOption } from '../components/SettingsModal'
import CodeEditor from '../components/CodeEditor'
import AnalysisPanel from '../components/AnalysisPanel'
import WaveformViewer, { type NormalizedWaveformData } from '../components/WaveformViewer'
import TemplateSelector from '../components/TemplateSelector'
import CircuitDiagram from '../components/CircuitDiagram'
import { analyzeCode, debugCode, optimizeCode, simulateCode } from '../utils/api'
import { Code2, Zap, Bug, Play, AlertCircle, Copy, Save, FolderOpen } from 'lucide-react'
import ProjectManagerModal, { type Project, type ProjectFile } from '../components/ProjectManagerModal'
import AIChatBar, { type WaveformPayload } from '../components/AIChatBar'

const DEFAULT_SIDEBAR_WIDTH = 280
const COLLAPSED_SIDEBAR_WIDTH = 64
const MIN_SIDEBAR_WIDTH = 240
const MAX_SIDEBAR_WIDTH = 420

type MentorshipModalProps = {
  isOpen: boolean
  onClose: () => void
}

const MentorshipModal = ({ isOpen, onClose }: MentorshipModalProps) => {
  if (!isOpen) return null

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4"
      onClick={handleOverlayClick}
    >
      <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-6 text-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close mentorship roadmap"
        >
          ×
        </button>

        <div>
          <h2 className="text-2xl font-bold text-white mb-2">VLSI Mentorship Roadmap</h2>
          <p className="text-primary-300 font-semibold">
            A guided journey from fundamentals to becoming an industry-ready silicon design engineer.
          </p>
        </div>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Stage 0 · Orientation (1–2 weeks)</h3>
          <p className="text-sm text-slate-300">
            Establish the learning environment, align expectations, and capture baseline skills.
          </p>
          <ul className="space-y-2 text-sm text-slate-200 list-disc list-inside">
            <li><span className="font-semibold text-white">Setup:</span> Install simulation (Icarus Verilog/Verilator), waveform viewers (GTKWave), and version control (Git).</li>
            <li><span className="font-semibold text-white">Primer:</span> Refresh discrete math, Boolean algebra, and number systems.</li>
            <li><span className="font-semibold text-white">Deliverable:</span> Personal learning goals, timeline, and initial Git repo.</li>
            <li><span className="font-semibold text-white">Resources:</span> Nand2Tetris coursera week 1–2, "Digital Design" by M. Mano chapters 1–2.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Stage 1 · Fundamentals (4–6 weeks)</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-2">
              <h4 className="font-semibold text-white">Concept Mastery</h4>
              <ul className="text-sm text-slate-200 space-y-1 list-disc list-inside">
                <li>Boolean algebra, Karnaugh maps, hazard analysis.</li>
                <li>Combinational building blocks: adders, multiplexers, decoders.</li>
                <li>Sequential logic: latches, flip-flops, counters, registers.</li>
                <li>Timing fundamentals: setup/hold, propagation, metastability.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-2">
              <h4 className="font-semibold text-white">Practice & Resources</h4>
              <ul className="text-sm text-slate-200 space-y-1 list-disc list-inside">
                <li>Design a multi-bit ALU in Verilog, synthesize to FPGA.</li>
                <li>Use simulation + waveform inspection to verify truth tables.</li>
                <li>Read: "CMOS VLSI Design" (Weste & Harris) chapters 1–3.</li>
                <li>MIT OpenCourseWare 6.004 lectures 1–6.</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-slate-400">Milestone: Publish a GitHub portfolio with well-documented combinational and sequential designs plus accompanying testbenches.</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Stage 2 · RTL Architecture & Verification (6–8 weeks)</h3>
          <ul className="space-y-2 text-sm text-slate-200 list-disc list-inside">
            <li><span className="font-semibold text-white">Advanced RTL:</span> Parameterization, pipelines, bus protocols (AXI/AHB), finite state machines for control logic.</li>
            <li><span className="font-semibold text-white">Verification Basics:</span> Directed vs random testing, self-checking testbenches, code coverage.</li>
            <li><span className="font-semibold text-white">HDL Best Practices:</span> Non-blocking vs blocking assignments, reset strategies, clock-domain crossing (CDC) essentials.</li>
            <li><span className="font-semibold text-white">Deliverables:</span> Build a pipelined datapath (e.g., simple RISC core) and accompany it with a scoreboard-based SystemVerilog/UVM-lite environment.</li>
            <li><span className="font-semibold text-white">Resources:</span> "Digital Design and Computer Architecture" (Harris & Harris), DvCon verification papers, ChipVerify tutorials.</li>
          </ul>
          <p className="text-xs text-slate-400">Milestone: Pass linting, synthesize to FPGA prototype, and document verification metrics (coverage ≥ 80%).</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Stage 3 · Physical Design & Timing Closure (6–8 weeks)</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-2">
              <h4 className="font-semibold text-white">Key Competencies</h4>
              <ul className="text-sm text-slate-200 space-y-1 list-disc list-inside">
                <li>Standard cell libraries, Liberty timing models, floorplanning basics.</li>
                <li>Static timing analysis (STA), clock tree synthesis, on-chip variation.</li>
                <li>Power estimation, IR drop, electromigration, signal integrity.</li>
                <li>DFT fundamentals: scan chains, ATPG overview, BIST concepts.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-2">
              <h4 className="font-semibold text-white">Hands-on Path</h4>
              <ul className="text-sm text-slate-200 space-y-1 list-disc list-inside">
                <li>Use open-source flows (OpenROAD/OpenLane) to implement a block from RTL to GDS.</li>
                <li>Perform STA with OpenSTA, analyze critical paths, fix violations.</li>
                <li>Experiment with power analysis using PrimeTime PX or OpenROAD power reports.</li>
                <li>Document design sign-off checklist (timing, power, DRC/LVS summaries).</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-slate-400">Milestone: Tape-out style report covering floorplan snapshots, timing closure strategy, and power numbers.</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Stage 4 · Specialization & Professional Readiness (ongoing)</h3>
          <ul className="space-y-2 text-sm text-slate-200 list-disc list-inside">
            <li><span className="font-semibold text-white">Choose Tracks:</span> Analog/Mixed-Signal, Physical Verification, Low-Power SoC, High-Speed Interfaces, Design Verification, or EDA tooling.</li>
            <li><span className="font-semibold text-white">Capstone Projects:</span> e.g., PCIe PHY modeling, AI accelerator microarchitecture, or RISC-V SoC with custom peripherals.</li>
            <li><span className="font-semibold text-white">Industry Exposure:</span> Join open-source silicon communities (OpenTitan, RISC-V International), contribute to GitHub issues, and prepare conference submissions.</li>
            <li><span className="font-semibold text-white">Career Materials:</span> Curate project portfolio, practice technical interviews, review case studies on tape-out failures/success stories.</li>
            <li><span className="font-semibold text-white">Continuous Learning:</span> Follow IEEE Solid-State Circuits Magazine, VLSI Symposium proceedings, and advanced courses (VLSI Physical Design @ IIT Bombay, Coursera Specializations).</li>
          </ul>
          <p className="text-xs text-slate-400">Milestone: Present a conference-style poster or technical blog summarizing the capstone project and lessons learned.</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Support System</h3>
          <ul className="space-y-2 text-sm text-slate-200 list-disc list-inside">
            <li><span className="font-semibold text-white">Mentor Cadence:</span> Weekly check-ins, monthly design reviews, quarterly mock interviews.</li>
            <li><span className="font-semibold text-white">Community:</span> Slack/Discord study groups, VLSI forums, local IEEE student chapters.</li>
            <li><span className="font-semibold text-white">Tooling Upgrades:</span> Explore industry tools (Synopsys, Cadence) through university programs or cloud labs.</li>
            <li><span className="font-semibold text-white">AI Assistant Tips:</span> Ask for project breakdowns, code reviews, resume bullet improvements, and interview question drills.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-xl font-semibold text-white">Immediate Next Actions</h3>
          <ul className="space-y-2 text-sm text-slate-200 list-disc list-inside">
            <li>Pick your current stage and add its tasks to the project manager.</li>
            <li>Schedule a weekly reflection log to capture progress and blockers.</li>
            <li>Share your roadmap with a mentor/peer for accountability.</li>
            <li>Use the AI assistant to generate practice problems or explain any unfamiliar concept from this plan.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

const normalizeSignals = (
  signals: WaveformPayload['signals'] | NormalizedWaveformData['signals']
): NormalizedWaveformData['signals'] => {
  if (!Array.isArray(signals)) {
    return []
  }
  return signals.map((signal, index) => {
    const record = signal as Record<string, unknown>
    const name = typeof record.name === 'string' && record.name.trim().length > 0
      ? record.name
      : `signal_${index}`
    const direction = typeof record.direction === 'string' ? record.direction : undefined
    return { name, direction }
  })
}

const convertPayloadToNormalized = (
  payload: WaveformPayload | null
): NormalizedWaveformData | null => {
  if (!payload) {
    return null
  }

  return {
    success: !payload.simulation_error,
    error: payload.simulation_error,
    waveform_data: payload.waveform_data ?? [],
    signals: normalizeSignals(payload.signals),
    waveform_url: payload.waveform_url,
    simulation_log: payload.simulation_log,
  }
}

const convertSimulationResultToNormalized = (result: any): NormalizedWaveformData => {
  if (!result || result.success === false) {
    return {
      success: false,
      error: result?.error ?? 'Simulation failed. Please check your code.',
      waveform_data: [],
      signals: normalizeSignals(result?.signals),
      waveform_url: result?.waveform_url ?? result?.waveform_file,
      simulation_log: result?.log ?? result?.simulation_log,
    }
  }

  return {
    success: true,
    error: undefined,
    waveform_data: result.waveform_data ?? [],
    signals: normalizeSignals(result.signals),
    waveform_url: result.waveform_url ?? result.waveform_file,
    simulation_log: result.log ?? result.simulation_log,
  }
}

function Dashboard() {
  const { user } = useAuth()
  const [code, setCode] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'waveform' | 'circuit'>('analysis')
  const [syntaxErrors, setSyntaxErrors] = useState<string[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState<ThemeOption>('dark')
  const [templateTestbench, setTemplateTestbench] = useState<string>('')
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false)
  const [unsavedWorkspace, setUnsavedWorkspace] = useState(false)
  const [waveformResult, setWaveformResult] = useState<NormalizedWaveformData | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMentorshipOpen, setIsMentorshipOpen] = useState(false)

  const handleWaveformUpdate = useCallback(
    (payload: WaveformPayload | null) => {
      const normalized = convertPayloadToNormalized(payload)
      setWaveformResult(normalized)
      if (normalized) {
        setActiveTab('waveform')
      }
    },
    [setActiveTab]
  )

  // Real-time syntax checking - Only show critical errors
  useEffect(() => {
    if (!code.trim()) {
      setSyntaxErrors([])
      return
    }
    

    const errors: string[] = []
    const lines = code.split('\n')
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()

      // Skip empty lines, comments, system tasks, module declarations, and block keywords
      if (!trimmedLine ||
          trimmedLine.startsWith('//') ||
          trimmedLine.startsWith('/*') ||
          trimmedLine.startsWith('$') ||
          trimmedLine.startsWith('module') ||
          trimmedLine.startsWith('endmodule') ||
          trimmedLine === 'begin' ||
          trimmedLine === 'end') {
        return
      }

      if (trimmedLine.startsWith('assign')) {
        const withoutComment = trimmedLine.split('//')[0].trimEnd()
        const normalized = withoutComment.replace(/\s+$/g, '')
        if (!normalized.endsWith(';')) {
          errors.push(`Line ${index + 1}: Missing semicolon after assign`)
        }
      }
    })

    // Only show if there are real errors (not false positives)
    setSyntaxErrors(errors)
  }, [code])

  useEffect(() => {
    const savedTheme = localStorage.getItem('preferredTheme') as ThemeOption | null
    if (savedTheme) {
      applyTheme(savedTheme)
      setTheme(savedTheme)
      return
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const defaultTheme: ThemeOption = prefersDark ? 'dark' : 'light'
    applyTheme(defaultTheme)
    setTheme(defaultTheme)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('vlsi-projects-v1')
    if (!stored) return
    try {
      const parsed: Project[] = JSON.parse(stored)
      setProjects(parsed)
      if (parsed.length > 0) {
        const [firstProject] = parsed
        setActiveProjectId(firstProject.id)
        const firstFile = firstProject.files[0]
        if (firstFile) {
          setActiveFileId(firstFile.id)
          setCode(firstFile.content)
        } else {
          setActiveFileId(null)
          setCode('')
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }, [])

  const applyTheme = (nextTheme: ThemeOption) => {
    document.body.classList.remove('theme-dark', 'theme-light')
    document.body.classList.add(nextTheme === 'light' ? 'theme-light' : 'theme-dark')
  }

  const handleAnalyze = async () => {
    if (!code.trim()) return
    setLoading(true)
    try {
      const result = await analyzeCode(code)
      const {
        waveform_data,
        signals,
        waveform_url,
        simulation_log,
        simulation_error,
        ...rest
      } = result

      setAnalysis(rest)
      const normalized = convertPayloadToNormalized({
        waveform_data,
        signals,
        waveform_url,
        simulation_log,
        simulation_error,
      })
      setWaveformResult(normalized)
      setActiveTab('analysis')
    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysis({
        success: false,
        error: 'Failed to analyze code. Please check your connection.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDebug = async () => {
    if (!code.trim()) return
    
    setLoading(true)
    try {
      const result = await debugCode(code)
      setAnalysis(result)
      setActiveTab('analysis')
    } catch (error) {
      console.error('Debug error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOptimize = async () => {
    if (!code.trim()) return
    
    setLoading(true)
    try {
      const result = await optimizeCode(code, ['performance', 'readability'])
      setAnalysis(result)
      setActiveTab('analysis')
    } catch (error) {
      console.error('Optimize error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSimulate = async () => {
    if (!code.trim()) return
    
    setLoading(true)
    try {
      const result = await simulateCode(code, templateTestbench)
      const normalized = convertSimulationResultToNormalized(result)
      setWaveformResult(normalized)
      setActiveTab('waveform')
    } catch (error) {
      console.error('Simulation error:', error)
      setWaveformResult({
        success: false,
        error: 'Simulation failed. Please check your code.',
        waveform_data: [],
        signals: [],
        waveform_url: undefined,
        simulation_log: undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (templateCode: string, testbench?: string) => {
    setCode(templateCode)
    setAnalysis(null)
    setWaveformResult(null)
    setTemplateTestbench(testbench || '')
    setActiveTab('analysis')
    if (activeProjectId && activeFileId) {
      updateFileContent(activeProjectId, activeFileId, templateCode)
    }
  }

  const handleSaveCode = () => {
    // Save code to localStorage
    const savedCodes = JSON.parse(localStorage.getItem('savedCodes') || '[]')
    const newCode = {
      id: Date.now(),
      code: code,
      timestamp: new Date().toISOString(),
      name: `Code_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}`
    }
    savedCodes.push(newCode)
    localStorage.setItem('savedCodes', JSON.stringify(savedCodes))
    alert('Code saved successfully!')
  }

  const handleLoadHistory = () => {
    setIsHistoryOpen(true)
  }

  const handleHistoryLoadCode = (savedCode: string) => {
    setCode(savedCode)
    setAnalysis(null)
    setWaveformResult(null)

    if (activeProjectId && activeFileId) {
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== activeProjectId) {
            return project
          }

          return {
            ...project,
            updatedAt: new Date().toISOString(),
            files: project.files.map((file) =>
              file.id === activeFileId
                ? {
                    ...file,
                    content: savedCode,
                  }
                : file
            ),
          }
        })
      )
    }

    setUnsavedWorkspace(true)
  }

  const handleOpenMentorship = () => {
    setIsMentorshipOpen(true)
  }

  useEffect(() => {
    const storedWidth = localStorage.getItem('sidebarWidth')
    if (storedWidth) {
      const parsed = Number.parseInt(storedWidth, 10)
      if (!Number.isNaN(parsed)) {
        const clamped = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, parsed))
        setSidebarWidth(clamped)
      }
    }

    const storedCollapsed = localStorage.getItem('sidebarCollapsed')
    if (storedCollapsed === 'true') {
      setIsSidebarCollapsed(true)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebarWidth', sidebarWidth.toString())
  }, [sidebarWidth])

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed ? 'true' : 'false')
  }, [isSidebarCollapsed])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy code')
    }
  }

  const handleOpenSettings = () => {
    setIsSettingsOpen(true)
  }

  const handleThemeChange = (nextTheme: ThemeOption) => {
    setTheme(nextTheme)
    applyTheme(nextTheme)
    localStorage.setItem('preferredTheme', nextTheme)
  }

  const updateFileContent = (projectId: string, fileId: string, content: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              updatedAt: new Date().toISOString(),
              files: project.files.map((file) =>
                file.id === fileId ? { ...file, content } : file
              ),
            }
          : project
      )
    )
    setUnsavedWorkspace(true)
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    if (activeProjectId && activeFileId) {
      updateFileContent(activeProjectId, activeFileId, value)
    }
  }

  const createProject = (name: string) => {
    const id = (globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}`)
    const timestamp = new Date().toISOString()
    const newProject: Project = {
      id,
      name,
      files: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    setProjects((prev) => [...prev, newProject])
    setActiveProjectId(id)
    setActiveFileId(null)
    setCode('')
    setAnalysis(null)
    setWaveformResult(null)
    setUnsavedWorkspace(true)
  }

  const deleteProject = (projectId: string) => {
    setProjects((prev) => {
      const filtered = prev.filter((project) => project.id !== projectId)

      if (activeProjectId === projectId) {
        if (filtered.length > 0) {
          const [nextProject] = filtered
          setActiveProjectId(nextProject.id)
          const nextFile = nextProject.files[0]
          if (nextFile) {
            setActiveFileId(nextFile.id)
            setCode(nextFile.content)
          } else {
            setActiveFileId(null)
            setCode('')
          }
        } else {
          setActiveProjectId(null)
          setActiveFileId(null)
          setCode('')
        }
        setAnalysis(null)
        setWaveformResult(null)
      }

      return filtered
    })

    setUnsavedWorkspace(true)
  }

  const selectProject = (projectId: string) => {
    setActiveProjectId(projectId)
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      const nextFile = project.files.find((file) => file.id === activeFileId) || project.files[0]
      if (nextFile) {
        setActiveFileId(nextFile.id)
        setCode(nextFile.content)
      } else {
        setActiveFileId(null)
        setCode('')
      }
    }
  }

  const createFile = (projectId: string, fileName: string) => {
    const fileId = (globalThis.crypto?.randomUUID?.() ?? `file-${Date.now()}`)
    const newFile: ProjectFile = {
      id: fileId,
      name: fileName,
      content: '',
    }
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              updatedAt: new Date().toISOString(),
              files: [...project.files, newFile],
            }
          : project
      )
    )
    setActiveProjectId(projectId)
    setActiveFileId(fileId)
    setCode('')
    setAnalysis(null)
    setWaveformResult(null)
    setUnsavedWorkspace(true)
  }

  const selectFile = (projectId: string, fileId: string) => {
    const project = projects.find((p) => p.id === projectId)
    const file = project?.files.find((f) => f.id === fileId)
    if (!project || !file) return
    setActiveProjectId(projectId)
    setActiveFileId(fileId)
    setCode(file.content)
  }

  const deleteFile = (projectId: string, fileId: string) => {
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) {
          return project
        }

        const updatedFiles = project.files.filter((file) => file.id !== fileId)
        if (activeProjectId === projectId && activeFileId === fileId) {
          if (updatedFiles.length > 0) {
            const [nextFile] = updatedFiles
            setActiveFileId(nextFile.id)
            setCode(nextFile.content)
          } else {
            setActiveFileId(null)
            setCode('')
          }
          setAnalysis(null)
          setWaveformResult(null)
        }

        return {
          ...project,
          files: updatedFiles,
          updatedAt: new Date().toISOString(),
        }
      })
    })

    setUnsavedWorkspace(true)
  }

  const handleSaveWorkspace = () => {
    try {
      localStorage.setItem('vlsi-projects-v1', JSON.stringify(projects))
      setUnsavedWorkspace(false)
    } catch (error) {
      console.error('Failed to save workspace:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          onSaveCode={handleSaveCode}
          onLoadHistory={handleLoadHistory}
          onOpenSettings={handleOpenSettings}
          projects={projects}
          activeProjectId={activeProjectId}
          activeFileId={activeFileId}
          onSelectProject={selectProject}
          onSelectFile={selectFile}
          onCreateProject={createProject}
          onCreateFile={createFile}
          onDeleteProject={deleteProject}
          onDeleteFile={deleteFile}
          onSaveWorkspace={handleSaveWorkspace}
          unsavedWorkspace={unsavedWorkspace}
          expandedWidth={sidebarWidth}
          collapsedWidth={COLLAPSED_SIDEBAR_WIDTH}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapsed={setIsSidebarCollapsed}
          onWidthChange={setSidebarWidth}
          onOpenMentorship={handleOpenMentorship}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
        <ProjectManagerModal
          isOpen={isProjectManagerOpen}
          onClose={() => setIsProjectManagerOpen(false)}
          projects={projects}
          activeProjectId={activeProjectId}
          activeFileId={activeFileId}
          onCreateProject={createProject}
          onSelectProject={selectProject}
          onCreateFile={createFile}
          onSelectFile={selectFile}
          onDeleteProject={deleteProject}
          onDeleteFile={deleteFile}
          onSaveProject={handleSaveWorkspace}
        />
      
      <main className="flex-1 px-4 py-6 overflow-auto">
        {/* Welcome Message */}
        {user && (
          <div className="mb-6 bg-gradient-to-r from-primary-900/30 to-purple-900/30 border border-primary-700/50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white">
              Welcome back, {user.name}! 👋
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Ready to design some amazing digital circuits?
            </p>
          </div>
        )}

        {/* Action Bar */}
        <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading || !code.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <Code2 size={18} />
              Analyze Code
            </button>
            
            <button
              onClick={handleDebug}
              disabled={loading || !code.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <Bug size={18} />
              Debug
            </button>
            
            <button
              onClick={handleOptimize}
              disabled={loading || !code.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <Zap size={18} />
              Optimize
            </button>
            
            <button
              onClick={handleSimulate}
              disabled={loading || !code.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <Play size={18} />
              Simulate
            </button>
          </div>
          
          <TemplateSelector onSelect={(template) => handleTemplateSelect(template.code, template.testbench)} />
        </div>

        {/* Syntax Error Alert */}
        {syntaxErrors.length > 0 && (
          <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-400 mb-2">Syntax Errors Detected</h3>
                <ul className="space-y-1">
                  {syntaxErrors.slice(0, 5).map((error, index) => (
                    <li key={index} className="text-sm text-gray-300">• {error}</li>
                  ))}
                  {syntaxErrors.length > 5 && (
                    <li className="text-sm text-gray-400">... and {syntaxErrors.length - 5} more</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Verilog Editor</h2>
                <div className="flex items-center gap-2">
                  {syntaxErrors.length > 0 && (
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                      {syntaxErrors.length} error{syntaxErrors.length > 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
                    title="Copy code"
                  >
                    <Copy size={14} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleSaveCode}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors"
                    title="Save code"
                  >
                    <Save size={14} />
                    Save
                  </button>
                  <button
                    onClick={() => setIsProjectManagerOpen(true)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors border ${
                      unsavedWorkspace
                        ? 'bg-yellow-600/30 text-yellow-200 border-yellow-500 hover:bg-yellow-600/40'
                        : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
                    }`}
                    title="Open project workspace"
                  >
                    <FolderOpen size={14} />
                    Projects
                    {unsavedWorkspace && (
                      <span className="ml-1 text-xs uppercase tracking-wide">• Unsaved</span>
                    )}
                  </button>
                </div>
              </div>
              <CodeEditor value={code} onChange={handleCodeChange} />
            </div>

            {/* Circuit Diagram */}
            <CircuitDiagram code={code} />
          </div>

          {/* Results Panel */}
          <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'analysis'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Analysis
                </button>
                <button
                  onClick={() => setActiveTab('waveform')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'waveform'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Waveform
                </button>
              </div>
            </div>
            
            <div className="h-[600px] overflow-auto">
              {activeTab === 'analysis' ? (
                <AnalysisPanel analysis={analysis} loading={loading} />
              ) : (
                <WaveformViewer data={waveformResult} loading={loading} />
              )}
            </div>
          </div>
        </div>

        {/* Educational Resources */}
        <div className="mt-8 bg-slate-800 rounded-xl shadow-2xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Learning Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <h4 className="font-semibold text-primary-400 mb-2">Getting Started</h4>
              <p className="text-gray-300 text-sm">
                Learn Verilog basics, module structure, and basic syntax with interactive examples.
              </p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <h4 className="font-semibold text-primary-400 mb-2">Best Practices</h4>
              <p className="text-gray-300 text-sm">
                Understand coding standards, naming conventions, and design patterns for better RTL.
              </p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <h4 className="font-semibold text-primary-400 mb-2">Advanced Topics</h4>
              <p className="text-gray-300 text-sm">
                Explore FSM design, timing analysis, and synthesis optimization techniques.
              </p>
            </div>
          </div>
        </div>
      </main>
      </div>
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadCode={handleHistoryLoadCode}
      />
      <MentorshipModal isOpen={isMentorshipOpen} onClose={() => setIsMentorshipOpen(false)} />
      <AIChatBar onWaveformUpdate={handleWaveformUpdate} />
    </div>
  )
}

export default Dashboard
