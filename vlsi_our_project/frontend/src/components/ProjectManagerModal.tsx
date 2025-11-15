import { useState } from 'react'
import { Plus, FolderOpen, FileText, Save, X, Trash2 } from 'lucide-react'

export interface ProjectFile {
  id: string
  name: string
  content: string
}

export interface Project {
  id: string
  name: string
  files: ProjectFile[]
  createdAt: string
  updatedAt: string
}

interface ProjectManagerModalProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
  activeProjectId: string | null
  activeFileId: string | null
  onCreateProject: (name: string) => void
  onSelectProject: (projectId: string) => void
  onCreateFile: (projectId: string, fileName: string) => void
  onSelectFile: (projectId: string, fileId: string) => void
  onDeleteProject: (projectId: string) => void
  onDeleteFile: (projectId: string, fileId: string) => void
  onSaveProject: () => void
}

const ProjectManagerModal = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  activeFileId,
  onCreateProject,
  onSelectProject,
  onCreateFile,
  onSelectFile,
  onDeleteProject,
  onDeleteFile,
  onSaveProject,
}: ProjectManagerModalProps) => {
  const [newProjectName, setNewProjectName] = useState('')
  const [newFileName, setNewFileName] = useState('')

  if (!isOpen) return null

  const activeProject = projects.find((project) => project.id === activeProjectId)

  const handleCreateProject = () => {
    const trimmed = newProjectName.trim()
    if (!trimmed) return
    onCreateProject(trimmed)
    setNewProjectName('')
  }

  const handleCreateFile = () => {
    if (!activeProject) return
    const trimmed = newFileName.trim()
    if (!trimmed) return
    onCreateFile(activeProject.id, trimmed)
    setNewFileName('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
      <div className="w-full max-w-4xl bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FolderOpen size={18} /> Project Workspace
            </h2>
            <p className="text-sm text-slate-400">Create projects, manage Verilog files, and switch between workspaces.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close project manager"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-700">
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Projects</h3>
              <p className="text-xs text-slate-400 mt-1">Choose a project or create a new one.</p>
            </div>

            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`group flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                    project.id === activeProjectId
                      ? 'border-primary-500 bg-primary-500/20 text-white'
                      : 'border-slate-700 bg-slate-900 hover:border-primary-500/70 hover:bg-slate-700/60 text-slate-300'
                  }`}
                >
                  <button
                    onClick={() => onSelectProject(project.id)}
                    className="flex-1 text-left"
                  >
                    <span className="font-medium truncate block">{project.name}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-300 hover:text-red-200"
                    title="Delete project"
                    aria-label={`Delete project ${project.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-xs text-slate-500">No projects yet. Create one below.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Project name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                  placeholder="e.g. Arithmetic Units"
                  className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                />
                <button
                  onClick={handleCreateProject}
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg flex items-center gap-1 text-sm"
                >
                  <Plus size={16} />
                  Create
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 md:col-span-2">
            {activeProject ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Files in {activeProject.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Select a file to edit it in the main editor. Changes are saved automatically.
                    </p>
                  </div>
                  <button
                    onClick={onSaveProject}
                    className="flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                  >
                    <Save size={16} /> Save workspace
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-auto pr-1">
                  {activeProject.files.map((file) => (
                    <div
                      key={file.id}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
                        file.id === activeFileId
                          ? 'border-primary-500 bg-primary-500/20 text-white'
                          : 'border-slate-700 bg-slate-900 hover:border-primary-500/70 hover:bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      <button
                        onClick={() => onSelectFile(activeProject.id, file.id)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <FileText size={16} />
                        <div className="flex-1 text-left">
                          <div className="font-medium truncate">{file.name}</div>
                          <div className="text-xs text-slate-400 truncate">
                            {file.content.length > 0 ? `${file.content.length} chars` : 'Empty file'}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => onDeleteFile(activeProject.id, file.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-300 hover:text-red-200"
                        title={`Delete file ${file.name}`}
                        aria-label={`Delete file ${file.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {activeProject.files.length === 0 && (
                    <p className="text-xs text-slate-500">No files yet. Add a file below.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">New file name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(event) => setNewFileName(event.target.value)}
                      placeholder="e.g. full_adder.v"
                      className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                    />
                    <button
                      onClick={handleCreateFile}
                      className="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg flex items-center gap-1 text-sm"
                    >
                      <Plus size={16} />
                      Add file
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                <FolderOpen size={32} className="text-slate-600" />
                <p className="text-sm">Select a project on the left to view its files.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectManagerModal
